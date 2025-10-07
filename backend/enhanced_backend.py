#!/usr/bin/env python3
import sys
import json
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

print("Python version:", sys.version)
print("Starting Enhanced Flask server...")

try:
    print("Flask and CORS imported successfully")
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# In-memory storage for demo purposes
complaints_db = [
    {
        "id": 1,
        "customerName": "John Doe",
        "email": "john@example.com",
        "subject": "Billing Issue",
        "description": "I was charged twice for my subscription",
        "priority": "high",
        "category": "billing",
        "status": "new",
        "timestamp": "2025-01-07T10:30:00Z",
        "sentiment": "frustrated"
    },
    {
        "id": 2,
        "customerName": "Jane Smith",
        "email": "jane@example.com",
        "subject": "Product Defect",
        "description": "The product arrived damaged",
        "priority": "medium",
        "category": "product",
        "status": "in_progress",
        "timestamp": "2025-01-07T09:15:00Z",
        "sentiment": "angry"
    }
]

next_id = 3

@app.route('/api/health')
def health():
    print("Health check endpoint called")
    return jsonify({"success": True, "data": {"status": "ok"}})

@app.route('/api/dashboard/stats')
def stats():
    print("Dashboard stats endpoint called")
    total_complaints = len(complaints_db)
    pending_complaints = len([c for c in complaints_db if c['status'] in ['new', 'in_progress']])
    
    # Count complaints from today
    today = datetime.now().date()
    today_complaints = len([c for c in complaints_db if datetime.fromisoformat(c['timestamp'].replace('Z', '')).date() == today])
    
    return jsonify({
        "success": True,
        "data": {
            "total_complaints": total_complaints,
            "pending_complaints": pending_complaints,
            "total_complaints_today": today_complaints
        }
    })

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    print("Get complaints endpoint called")
    return jsonify({
        "success": True,
        "data": complaints_db
    })

@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    print("Create complaint endpoint called")
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['customerName', 'email', 'subject', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400
        
        # Create new complaint
        global next_id
        new_complaint = {
            "id": next_id,
            "customerName": data['customerName'],
            "email": data['email'],
            "subject": data['subject'],
            "description": data['description'],
            "priority": data.get('priority', 'medium'),
            "category": data.get('category', 'general'),
            "status": "new",
            "timestamp": datetime.now().isoformat() + "Z",
            "sentiment": data.get('sentiment', 'neutral')
        }
        
        complaints_db.append(new_complaint)
        next_id += 1
        
        print(f"Created complaint with ID: {new_complaint['id']}")
        
        return jsonify({
            "success": True,
            "data": new_complaint,
            "message": "Complaint created successfully"
        }), 201
        
    except Exception as e:
        print(f"Error creating complaint: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to create complaint"
        }), 500

@app.route('/api/complaints/<int:complaint_id>', methods=['PUT'])
def update_complaint(complaint_id):
    print(f"Update complaint endpoint called for ID: {complaint_id}")
    try:
        data = request.get_json()
        
        # Find the complaint
        complaint = next((c for c in complaints_db if c['id'] == complaint_id), None)
        if not complaint:
            return jsonify({
                "success": False,
                "message": "Complaint not found"
            }), 404
        
        # Update fields
        for key, value in data.items():
            if key in complaint and key != 'id':
                complaint[key] = value
        
        print(f"Updated complaint ID: {complaint_id}")
        
        return jsonify({
            "success": True,
            "data": complaint,
            "message": "Complaint updated successfully"
        })
        
    except Exception as e:
        print(f"Error updating complaint: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to update complaint"
        }), 500

@app.route('/api/teams')
def get_teams():
    print("Get teams endpoint called")
    teams = [
        {"id": 1, "name": "Billing Team", "avgResponseTime": 15, "resolutionRate": 95},
        {"id": 2, "name": "Technical Support", "avgResponseTime": 25, "resolutionRate": 88},
        {"id": 3, "name": "Customer Care", "avgResponseTime": 20, "resolutionRate": 92}
    ]
    return jsonify({
        "success": True,
        "data": teams
    })

@app.route('/api/analytics')
def get_analytics():
    print("Get analytics endpoint called")
    analytics = {
        "priority_distribution": {
            "urgent": len([c for c in complaints_db if c['priority'] == 'urgent']),
            "high": len([c for c in complaints_db if c['priority'] == 'high']),
            "medium": len([c for c in complaints_db if c['priority'] == 'medium']),
            "low": len([c for c in complaints_db if c['priority'] == 'low'])
        },
        "category_breakdown": {
            "billing": len([c for c in complaints_db if c['category'] == 'billing']),
            "technical": len([c for c in complaints_db if c['category'] == 'technical']),
            "product": len([c for c in complaints_db if c['category'] == 'product']),
            "delivery": len([c for c in complaints_db if c['category'] == 'delivery']),
            "customer_care": len([c for c in complaints_db if c['category'] == 'customer_care'])
        }
    }
    return jsonify({
        "success": True,
        "data": analytics
    })

if __name__ == '__main__':
    print("Starting Enhanced Flask server on http://localhost:5000")
    print("Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/dashboard/stats - Dashboard statistics")
    print("  GET  /api/complaints - Get all complaints")
    print("  POST /api/complaints - Create new complaint")
    print("  PUT  /api/complaints/<id> - Update complaint")
    print("  GET  /api/teams - Get teams")
    print("  GET  /api/analytics - Get analytics")
    print("Press Ctrl+C to stop the server")
    
    try:
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
