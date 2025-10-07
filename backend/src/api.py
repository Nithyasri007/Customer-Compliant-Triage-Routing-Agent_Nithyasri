"""
Flask REST API for the Customer Complaint Triage Agent.

This module provides RESTful endpoints for the frontend application,
including dashboard data, complaint management, team routing, and analytics.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
import sys
import os

# Add src directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from config import config
from database import ComplaintDatabase
from email_handler import EmailHandler
from ai_classifier import ComplaintClassifier
from router import ComplaintRouter

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize components
database = ComplaintDatabase(config.database_path)
email_handler = EmailHandler(config)
classifier = ComplaintClassifier(config.anthropic_api_key)
router = ComplaintRouter(config)

logger = logging.getLogger(__name__)

# Response helper functions
def success_response(data: Any, message: str = None) -> Dict[str, Any]:
    """Create a standardized success response."""
    response = {"success": True, "data": data}
    if message:
        response["message"] = message
    return response

def error_response(error: str, code: int = 400) -> tuple:
    """Create a standardized error response."""
    return jsonify({"success": False, "error": error, "code": code}), code

# ============= DASHBOARD ENDPOINTS =============

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """
    Return dashboard statistics:
    - Total complaints today
    - Pending complaints
    - Average response time
    - SLA compliance rate
    """
    try:
        analytics = database.get_analytics()
        
        # Calculate today's complaints
        today = datetime.now().date()
        today_complaints = database.get_complaints_by_date_range(
            today.strftime('%Y-%m-%d'),
            today.strftime('%Y-%m-%d')
        )
        
        # Calculate pending complaints
        pending_complaints = database.get_complaints_by_status('New')
        pending_count = len(pending_complaints)
        
        # Calculate SLA compliance (simplified)
        resolved_complaints = database.get_complaints_by_status('Resolved')
        sla_compliant = 0
        for complaint in resolved_complaints:
            created = datetime.fromisoformat(complaint['created_at'].replace('Z', '+00:00'))
            updated = datetime.fromisoformat(complaint['updated_at'].replace('Z', '+00:00'))
            response_time = (updated - created).total_seconds() / 3600  # hours
            
            # SLA thresholds based on priority
            sla_threshold = {
                'Urgent': 2,
                'High': 4,
                'Medium': 24,
                'Low': 48
            }.get(complaint['priority'], 24)
            
            if response_time <= sla_threshold:
                sla_compliant += 1
        
        sla_compliance_rate = (sla_compliant / len(resolved_complaints) * 100) if resolved_complaints else 100
        
        stats = {
            "total_complaints_today": len(today_complaints),
            "pending_complaints": pending_count,
            "total_complaints": analytics.get('total_complaints', 0),
            "average_response_time_hours": analytics.get('avg_response_days', 0) * 24,
            "sla_compliance_rate": round(sla_compliance_rate, 1),
            "recent_complaints_24h": analytics.get('recent_complaints', 0)
        }
        
        return jsonify(success_response(stats))
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return error_response("Failed to fetch dashboard statistics", 500)

@app.route('/api/dashboard/charts', methods=['GET'])
def get_dashboard_charts():
    """
    Return chart data:
    - Priority distribution (pie chart data)
    - Category breakdown (bar chart data)
    - Complaints over time (line chart data)
    """
    try:
        analytics = database.get_analytics()
        
        # Priority distribution for pie chart
        priority_data = []
        for priority, count in analytics.get('by_priority', {}).items():
            priority_data.append({
                "label": priority,
                "value": count,
                "color": {
                    'Urgent': '#dc3545',
                    'High': '#fd7e14',
                    'Medium': '#ffc107',
                    'Low': '#28a745'
                }.get(priority, '#6c757d')
            })
        
        # Category breakdown for bar chart
        category_data = []
        for category, count in analytics.get('by_category', {}).items():
            category_data.append({
                "category": category,
                "count": count
            })
        
        # Complaints over time (last 7 days)
        time_series_data = []
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).date()
            day_complaints = database.get_complaints_by_date_range(
                date.strftime('%Y-%m-%d'),
                date.strftime('%Y-%m-%d')
            )
            time_series_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "count": len(day_complaints)
            })
        time_series_data.reverse()  # Chronological order
        
        charts_data = {
            "priority_distribution": priority_data,
            "category_breakdown": category_data,
            "complaints_over_time": time_series_data
        }
        
        return jsonify(success_response(charts_data))
        
    except Exception as e:
        logger.error(f"Error getting dashboard charts: {e}")
        return error_response("Failed to fetch chart data", 500)

@app.route('/api/dashboard/recent', methods=['GET'])
def get_recent_complaints():
    """
    Return last 10 complaints with:
    - id, timestamp, customer, subject, category, priority, status
    """
    try:
        recent = database.get_recent_complaints(limit=10)
        
        # Format the data for frontend
        formatted_complaints = []
        for complaint in recent:
            formatted_complaints.append({
                "id": complaint['id'],
                "timestamp": complaint['created_at'],
                "customer_name": complaint['customer_name'] or 'Unknown',
                "customer_email": complaint['customer_email'],
                "subject": complaint['subject'],
                "category": complaint['category'],
                "priority": complaint['priority'],
                "status": complaint['status'],
                "assigned_team": complaint['assigned_team']
            })
        
        return jsonify(success_response(formatted_complaints))
        
    except Exception as e:
        logger.error(f"Error getting recent complaints: {e}")
        return error_response("Failed to fetch recent complaints", 500)

@app.route('/api/dashboard/activity', methods=['GET'])
def get_activity_feed():
    """
    Return recent activity events:
    - Event type, description, timestamp
    Last 20 events
    """
    try:
        # Get recent complaints and format as activity events
        recent_complaints = database.get_recent_complaints(limit=20)
        
        activity_events = []
        for complaint in recent_complaints:
            # Create activity events for each complaint
            activity_events.append({
                "type": "complaint_received",
                "description": f"New {complaint['priority']} priority {complaint['category']} complaint from {complaint['customer_name']}",
                "timestamp": complaint['created_at'],
                "complaint_id": complaint['id'],
                "priority": complaint['priority']
            })
        
        return jsonify(success_response(activity_events))
        
    except Exception as e:
        logger.error(f"Error getting activity feed: {e}")
        return error_response("Failed to fetch activity feed", 500)

# ============= COMPLAINTS CRUD ENDPOINTS =============

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    """
    Get all complaints with filtering:
    Query params: status, priority, category, search, page, limit
    """
    try:
        # Get query parameters
        status = request.args.get('status')
        priority = request.args.get('priority')
        category = request.args.get('category')
        search = request.args.get('search')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Get all complaints (simplified - in production, implement proper filtering)
        all_complaints = database.get_recent_complaints(limit=1000)  # Get more for filtering
        
        # Apply filters
        filtered_complaints = []
        for complaint in all_complaints:
            if status and complaint['status'] != status:
                continue
            if priority and complaint['priority'] != priority:
                continue
            if category and complaint['category'] != category:
                continue
            if search and search.lower() not in (complaint['subject'] + ' ' + complaint['body']).lower():
                continue
            filtered_complaints.append(complaint)
        
        # Pagination
        total = len(filtered_complaints)
        start = (page - 1) * limit
        end = start + limit
        paginated_complaints = filtered_complaints[start:end]
        
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        result = {
            "complaints": paginated_complaints,
            "total": total,
            "page": page,
            "total_pages": total_pages,
            "limit": limit
        }
        
        return jsonify(success_response(result))
        
    except Exception as e:
        logger.error(f"Error getting complaints: {e}")
        return error_response("Failed to fetch complaints", 500)

@app.route('/api/complaints/<int:complaint_id>', methods=['GET'])
def get_complaint_detail(complaint_id):
    """
    Get single complaint with full details:
    - All complaint fields
    - AI classification results
    - Routing information
    - Activity timeline
    """
    try:
        complaint = database.get_complaint(complaint_id)
        
        if not complaint:
            return error_response("Complaint not found", 404)
        
        # Get activity timeline (simplified)
        activity_timeline = [
            {
                "timestamp": complaint['created_at'],
                "action": "Complaint Received",
                "description": f"Complaint received from {complaint['customer_name']}",
                "user": "System"
            }
        ]
        
        if complaint['updated_at'] != complaint['created_at']:
            activity_timeline.append({
                "timestamp": complaint['updated_at'],
                "action": "Status Updated",
                "description": f"Status changed to {complaint['status']}",
                "user": "System"
            })
        
        # Combine complaint data with timeline
        complaint_detail = {
            **complaint,
            "activity_timeline": activity_timeline
        }
        
        return jsonify(success_response(complaint_detail))
        
    except Exception as e:
        logger.error(f"Error getting complaint detail: {e}")
        return error_response("Failed to fetch complaint details", 500)

@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    """
    Create new complaint from web form submission:
    Body: {customer_name, customer_email, subject, body, channel}
    
    Process:
    1. Validate input
    2. Run AI classification
    3. Determine routing
    4. Store in database
    5. Send acknowledgment email
    6. Return complaint object with id
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customer_name', 'customer_email', 'subject', 'body']
        for field in required_fields:
            if not data.get(field):
                return error_response(f"Missing required field: {field}", 400)
        
        # Prepare email data for classification
        email_data = {
            'email_id': f"web-form-{datetime.now().timestamp()}",
            'subject': data['subject'],
            'body': data['body'],
            'sender': f"{data['customer_name']} <{data['customer_email']}>",
            'customer_email': data['customer_email']
        }
        
        # Classify complaint using AI
        classification_result = classifier.classify_complaint(email_data)
        
        # Prepare complaint data for database
        complaint_data = {
            'email_id': email_data['email_id'],
            'customer_email': data['customer_email'],
            'customer_name': data['customer_name'],
            'subject': data['subject'],
            'body': data['body'],
            'category': classification_result['category'],
            'priority': classification_result['priority'],
            'sentiment': classification_result['sentiment'],
            'assigned_team': router._determine_assigned_team(classification_result['category']),
            'key_entities': str(classification_result['key_entities']),
            'summary': classification_result['summary'],
            'suggested_action': classification_result['suggested_action']
        }
        
        # Store in database
        complaint_id = database.insert_complaint(complaint_data)
        complaint_data['id'] = complaint_id
        
        # Route complaint
        routing_result = router.route_complaint(complaint_data)
        complaint_data.update(routing_result)
        
        # Send acknowledgment email
        email_sent = email_handler.send_acknowledgment_email(
            data['customer_email'], 
            complaint_data
        )
        
        # Send team notification
        notification_sent = router.send_team_notification(
            routing_result, 
            complaint_data, 
            email_handler
        )
        
        return jsonify(success_response({
            **complaint_data,
            "email_sent": email_sent,
            "notification_sent": notification_sent
        }, "Complaint created successfully"))
        
    except Exception as e:
        logger.error(f"Error creating complaint: {e}")
        return error_response("Failed to create complaint", 500)

@app.route('/api/complaints/<int:complaint_id>', methods=['PUT'])
def update_complaint(complaint_id):
    """
    Update complaint (reassign, change priority, etc.)
    Body: fields to update
    """
    try:
        data = request.get_json()
        
        # Get existing complaint
        complaint = database.get_complaint(complaint_id)
        if not complaint:
            return error_response("Complaint not found", 404)
        
        # Update fields that are provided
        update_fields = {}
        if 'status' in data:
            update_fields['status'] = data['status']
        if 'assigned_team' in data:
            update_fields['assigned_team'] = data['assigned_team']
        if 'priority' in data:
            update_fields['priority'] = data['priority']
        
        # Update in database
        if update_fields:
            success = database.update_status(
                complaint_id, 
                update_fields.get('status', complaint['status']),
                update_fields.get('assigned_team')
            )
            
            if not success:
                return error_response("Failed to update complaint", 500)
        
        # Get updated complaint
        updated_complaint = database.get_complaint(complaint_id)
        
        return jsonify(success_response(updated_complaint, "Complaint updated successfully"))
        
    except Exception as e:
        logger.error(f"Error updating complaint: {e}")
        return error_response("Failed to update complaint", 500)

@app.route('/api/complaints/<int:complaint_id>/resolve', methods=['POST'])
def resolve_complaint(complaint_id):
    """
    Mark complaint as resolved
    """
    try:
        success = database.update_status(complaint_id, 'Resolved')
        
        if not success:
            return error_response("Complaint not found", 404)
        
        complaint = database.get_complaint(complaint_id)
        return jsonify(success_response(complaint, "Complaint resolved successfully"))
        
    except Exception as e:
        logger.error(f"Error resolving complaint: {e}")
        return error_response("Failed to resolve complaint", 500)

@app.route('/api/complaints/<int:complaint_id>/escalate', methods=['POST'])
def escalate_complaint(complaint_id):
    """
    Escalate complaint to manager
    """
    try:
        complaint = database.get_complaint(complaint_id)
        if not complaint:
            return error_response("Complaint not found", 404)
        
        # Update priority to Urgent if not already
        if complaint['priority'] != 'Urgent':
            database.update_status(complaint_id, complaint['status'])
        
        # Send escalation notification to manager
        escalation_data = {
            **complaint,
            'subject': f"ESCALATION: {complaint['priority']} Priority Complaint - #{complaint_id}",
            'assigned_team': 'Management'
        }
        
        notification_sent = email_handler.send_team_notification(
            config.manager_email,
            escalation_data
        )
        
        updated_complaint = database.get_complaint(complaint_id)
        
        return jsonify(success_response({
            **updated_complaint,
            "escalation_sent": notification_sent
        }, "Complaint escalated successfully"))
        
    except Exception as e:
        logger.error(f"Error escalating complaint: {e}")
        return error_response("Failed to escalate complaint", 500)

@app.route('/api/complaints/<int:complaint_id>/reclassify', methods=['POST'])
def reclassify_complaint(complaint_id):
    """
    Re-run AI classification on existing complaint
    """
    try:
        complaint = database.get_complaint(complaint_id)
        if not complaint:
            return error_response("Complaint not found", 404)
        
        # Prepare email data for reclassification
        email_data = {
            'email_id': complaint['email_id'],
            'subject': complaint['subject'],
            'body': complaint['body'],
            'sender': f"{complaint['customer_name']} <{complaint['customer_email']}>",
            'customer_email': complaint['customer_email']
        }
        
        # Reclassify using AI
        classification_result = classifier.classify_complaint(email_data)
        
        # Update complaint with new classification
        updated_data = {
            'category': classification_result['category'],
            'priority': classification_result['priority'],
            'sentiment': classification_result['sentiment'],
            'assigned_team': router._determine_assigned_team(classification_result['category']),
            'key_entities': str(classification_result['key_entities']),
            'summary': classification_result['summary'],
            'suggested_action': classification_result['suggested_action']
        }
        
        # Update in database
        database.update_status(complaint_id, complaint['status'], updated_data['assigned_team'])
        
        updated_complaint = database.get_complaint(complaint_id)
        
        return jsonify(success_response({
            **updated_complaint,
            "reclassification_result": classification_result
        }, "Complaint reclassified successfully"))
        
    except Exception as e:
        logger.error(f"Error reclassifying complaint: {e}")
        return error_response("Failed to reclassify complaint", 500)

# ============= TEAMS ENDPOINTS =============

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """
    Return all teams with:
    - Team info, members, active complaints count, stats
    """
    try:
        analytics = database.get_analytics()
        team_stats = analytics.get('by_team', {})
        
        # Define team information
        teams = [
            {
                "id": 1,
                "name": "Billing Team",
                "email": config.billing_team_email,
                "description": "Handles billing and payment issues",
                "active_complaints": team_stats.get(config.billing_team_email, 0),
                "categories": ["Billing Issue"]
            },
            {
                "id": 2,
                "name": "Technical Team",
                "email": config.tech_team_email,
                "description": "Handles technical support and product defects",
                "active_complaints": team_stats.get(config.tech_team_email, 0),
                "categories": ["Technical Support", "Product Defect"]
            },
            {
                "id": 3,
                "name": "Refunds Team",
                "email": config.refunds_team_email,
                "description": "Processes refunds and returns",
                "active_complaints": team_stats.get(config.refunds_team_email, 0),
                "categories": ["Refund Request"]
            },
            {
                "id": 4,
                "name": "Delivery Team",
                "email": config.delivery_team_email,
                "description": "Manages shipping and delivery issues",
                "active_complaints": team_stats.get(config.delivery_team_email, 0),
                "categories": ["Delivery Problem"]
            },
            {
                "id": 5,
                "name": "Account Team",
                "email": config.account_team_email,
                "description": "Handles account-related issues",
                "active_complaints": team_stats.get(config.account_team_email, 0),
                "categories": ["Account Issue"]
            },
            {
                "id": 6,
                "name": "General Support Team",
                "email": config.general_team_email,
                "description": "Handles general inquiries and other issues",
                "active_complaints": team_stats.get(config.general_team_email, 0),
                "categories": ["General Inquiry"]
            }
        ]
        
        return jsonify(success_response(teams))
        
    except Exception as e:
        logger.error(f"Error getting teams: {e}")
        return error_response("Failed to fetch teams", 500)

@app.route('/api/teams/<int:team_id>/assign', methods=['POST'])
def assign_to_team(team_id):
    """
    Assign complaint to team
    Body: { complaint_id: int }
    """
    try:
        data = request.get_json()
        complaint_id = data.get('complaint_id')
        
        if not complaint_id:
            return error_response("Missing complaint_id", 400)
        
        # Get team information
        teams_response = get_teams()
        teams_data = teams_response[0].get_json()['data']
        
        team = next((t for t in teams_data if t['id'] == team_id), None)
        if not team:
            return error_response("Team not found", 404)
        
        # Update complaint assignment
        success = database.update_status(
            complaint_id, 
            'Assigned',
            team['name']
        )
        
        if not success:
            return error_response("Complaint not found", 404)
        
        updated_complaint = database.get_complaint(complaint_id)
        
        return jsonify(success_response(updated_complaint, f"Complaint assigned to {team['name']}"))
        
    except Exception as e:
        logger.error(f"Error assigning to team: {e}")
        return error_response("Failed to assign complaint to team", 500)

# ============= ANALYTICS ENDPOINTS =============

@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    """
    Query params: time_range (today, 7days, 30days, 90days)
    Return comprehensive analytics data
    """
    try:
        time_range = request.args.get('time_range', '30days')
        
        # Calculate date range
        end_date = datetime.now().date()
        if time_range == 'today':
            start_date = end_date
        elif time_range == '7days':
            start_date = end_date - timedelta(days=7)
        elif time_range == '30days':
            start_date = end_date - timedelta(days=30)
        elif time_range == '90days':
            start_date = end_date - timedelta(days=90)
        else:
            start_date = end_date - timedelta(days=30)
        
        # Get complaints in date range
        complaints = database.get_complaints_by_date_range(
            start_date.strftime('%Y-%m-%d'),
            end_date.strftime('%Y-%m-%d')
        )
        
        # Calculate analytics
        total_complaints = len(complaints)
        
        # Category breakdown
        category_breakdown = {}
        for complaint in complaints:
            category = complaint['category']
            category_breakdown[category] = category_breakdown.get(category, 0) + 1
        
        # Priority breakdown
        priority_breakdown = {}
        for complaint in complaints:
            priority = complaint['priority']
            priority_breakdown[priority] = priority_breakdown.get(priority, 0) + 1
        
        # Status breakdown
        status_breakdown = {}
        for complaint in complaints:
            status = complaint['status']
            status_breakdown[status] = status_breakdown.get(status, 0) + 1
        
        # Team workload
        team_workload = {}
        for complaint in complaints:
            team = complaint['assigned_team']
            team_workload[team] = team_workload.get(team, 0) + 1
        
        overview = {
            "time_range": time_range,
            "total_complaints": total_complaints,
            "category_breakdown": category_breakdown,
            "priority_breakdown": priority_breakdown,
            "status_breakdown": status_breakdown,
            "team_workload": team_workload,
            "date_range": {
                "start_date": start_date.strftime('%Y-%m-%d'),
                "end_date": end_date.strftime('%Y-%m-%d')
            }
        }
        
        return jsonify(success_response(overview))
        
    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")
        return error_response("Failed to fetch analytics overview", 500)

@app.route('/api/analytics/trends', methods=['GET'])
def get_trends():
    """
    Return time-series data for charts
    """
    try:
        # Get complaints over last 30 days
        trends_data = []
        for i in range(30):
            date = (datetime.now() - timedelta(days=i)).date()
            day_complaints = database.get_complaints_by_date_range(
                date.strftime('%Y-%m-%d'),
                date.strftime('%Y-%m-%d')
            )
            
            # Categorize by priority
            priority_counts = {'Urgent': 0, 'High': 0, 'Medium': 0, 'Low': 0}
            for complaint in day_complaints:
                priority = complaint['priority']
                if priority in priority_counts:
                    priority_counts[priority] += 1
            
            trends_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "total": len(day_complaints),
                **priority_counts
            })
        
        trends_data.reverse()  # Chronological order
        
        return jsonify(success_response(trends_data))
        
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        return error_response("Failed to fetch trends data", 500)

# ============= UTILITY ENDPOINTS =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Return { status: "ok", timestamp: current_time }
    """
    try:
        # Test database connection
        analytics = database.get_analytics()
        
        health_data = {
            "status": "ok",
            "timestamp": datetime.now().isoformat(),
            "database": "connected",
            "total_complaints": analytics.get('total_complaints', 0)
        }
        
        return jsonify(success_response(health_data))
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return error_response("Health check failed", 500)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return error_response("Endpoint not found", 404)

@app.errorhandler(500)
def internal_error(error):
    return error_response("Internal server error", 500)

@app.errorhandler(400)
def bad_request(error):
    return error_response("Bad request", 400)

if __name__ == '__main__':
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Run Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
