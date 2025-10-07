#!/usr/bin/env python3
"""
Main application for the Customer Complaint Triage & Routing Agent.

This is the main entry point that orchestrates the entire complaint processing
workflow: email reading, AI classification, routing, and notifications.
Now includes Flask API server for frontend integration.
"""

import sys
import os
import time
import logging
import argparse
import threading
from datetime import datetime
from typing import List, Dict, Any

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from config import config
from database import ComplaintDatabase
from email_handler import EmailHandler
from ai_classifier import ComplaintClassifier
from router import ComplaintRouter
from api import app


class ComplaintTriageAgent:
    """Main application class for the complaint triage agent."""
    
    def __init__(self):
        """Initialize the complaint triage agent."""
        self.setup_logging()
        
        # Initialize components
        self.database = ComplaintDatabase(config.database_path)
        self.email_handler = EmailHandler(config)
        self.classifier = ComplaintClassifier(config.anthropic_api_key)
        self.router = ComplaintRouter(config)
        
        self.logger = logging.getLogger(__name__)
        self.logger.info("Complaint Triage Agent initialized successfully")
    
    def setup_logging(self) -> None:
        """Setup logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('complaint_agent.log'),
                logging.StreamHandler(sys.stdout)
            ]
        )
    
    def process_complaints(self, max_emails: int = 50) -> Dict[str, Any]:
        """
        Main processing loop for complaints.
        
        Args:
            max_emails: Maximum number of emails to process in one run
            
        Returns:
            Processing results summary
        """
        self.logger.info("Starting complaint processing cycle")
        start_time = datetime.now()
        
        results = {
            'emails_processed': 0,
            'complaints_classified': 0,
            'complaints_routed': 0,
            'notifications_sent': 0,
            'errors': 0,
            'processing_time': 0
        }
        
        try:
            # Step 1: Fetch unread emails
            self.logger.info("Fetching unread emails...")
            unread_emails = self.email_handler.get_unread_emails()
            
            if not unread_emails:
                self.logger.info("No unread emails found")
                return results
            
            # Limit number of emails to process
            emails_to_process = unread_emails[:max_emails]
            self.logger.info(f"Processing {len(emails_to_process)} emails")
            
            # Step 2: Process each email
            for email_data in emails_to_process:
                try:
                    result = self.process_single_complaint(email_data)
                    results['emails_processed'] += 1
                    results['complaints_classified'] += result.get('classified', 0)
                    results['complaints_routed'] += result.get('routed', 0)
                    results['notifications_sent'] += result.get('notifications_sent', 0)
                    
                except Exception as e:
                    self.logger.error(f"Error processing email {email_data.get('email_id', 'unknown')}: {e}")
                    results['errors'] += 1
                    continue
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            results['processing_time'] = processing_time
            
            self.logger.info(f"Processing cycle completed in {processing_time:.2f} seconds")
            self.logger.info(f"Results: {results}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in main processing loop: {e}")
            results['errors'] += 1
            return results
    
    def process_single_complaint(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single complaint email.
        
        Args:
            email_data: Email data dictionary
            
        Returns:
            Processing result for this complaint
        """
        email_id = email_data.get('email_id', 'unknown')
        self.logger.info(f"Processing complaint from email: {email_id}")
        
        result = {'classified': 0, 'routed': 0, 'notifications_sent': 0}
        
        try:
            # Check if complaint already exists
            existing_complaint = self.database.get_complaint_by_email_id(email_id)
            if existing_complaint:
                self.logger.info(f"Complaint {email_id} already exists, skipping")
                return result
            
            # Step 1: Classify complaint using AI
            self.logger.info("Classifying complaint with AI...")
            classification_result = self.classifier.classify_complaint(email_data)
            result['classified'] = 1
            
            # Step 2: Prepare complaint data for database
            complaint_data = {
                'email_id': email_id,
                'customer_email': email_data.get('customer_email', ''),
                'subject': email_data.get('subject', ''),
                'body': email_data.get('body', ''),
                **classification_result
            }
            
            # Step 3: Store in database
            complaint_id = self.database.insert_complaint(complaint_data)
            complaint_data['id'] = complaint_id
            self.logger.info(f"Complaint stored in database with ID: {complaint_id}")
            
            # Step 4: Route complaint
            self.logger.info("Routing complaint to appropriate team...")
            routing_result = self.router.route_complaint(complaint_data)
            complaint_data.update(routing_result)
            result['routed'] = 1
            
            # Step 5: Send notifications
            notifications_sent = 0
            
            # Send acknowledgment to customer
            if complaint_data.get('customer_email'):
                if self.email_handler.send_acknowledgment_email(
                    complaint_data['customer_email'], 
                    complaint_data
                ):
                    notifications_sent += 1
                    self.logger.info("Customer acknowledgment sent")
            
            # Send team notification
            if self.router.send_team_notification(routing_result, complaint_data, self.email_handler):
                notifications_sent += 1
                self.logger.info("Team notification sent")
            
            result['notifications_sent'] = notifications_sent
            
            # Step 6: Mark email as read
            if email_data.get('internal_id'):
                self.email_handler.mark_as_read(email_data['internal_id'])
                self.logger.info("Email marked as read")
            
            self.logger.info(f"Successfully processed complaint {complaint_id}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing complaint {email_id}: {e}")
            raise
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """
        Get data for dashboard display.
        
        Returns:
            Dashboard data including analytics and recent complaints
        """
        try:
            analytics = self.database.get_analytics()
            recent_complaints = self.database.get_recent_complaints(limit=10)
            
            dashboard_data = {
                'analytics': analytics,
                'recent_complaints': recent_complaints,
                'last_updated': datetime.now().isoformat()
            }
            
            return dashboard_data
            
        except Exception as e:
            self.logger.error(f"Error getting dashboard data: {e}")
            return {}
    
    def run_continuous(self, interval_minutes: int = 5) -> None:
        """
        Run the agent continuously with specified interval.
        
        Args:
            interval_minutes: Minutes between processing cycles
        """
        self.logger.info(f"Starting continuous mode with {interval_minutes} minute intervals")
        
        try:
            while True:
                self.logger.info("Starting processing cycle...")
                results = self.process_complaints()
                
                self.logger.info(f"Cycle completed. Next cycle in {interval_minutes} minutes.")
                time.sleep(interval_minutes * 60)
                
        except KeyboardInterrupt:
            self.logger.info("Continuous mode stopped by user")
        except Exception as e:
            self.logger.error(f"Error in continuous mode: {e}")
    
    def run_once(self) -> None:
        """Run the agent once and exit."""
        self.logger.info("Running in single mode")
        results = self.process_complaints()
        
        if results['errors'] > 0:
            self.logger.warning(f"Processing completed with {results['errors']} errors")
            sys.exit(1)
        else:
            self.logger.info("Processing completed successfully")


def run_email_monitoring(agent, interval_minutes=5):
    """Run email monitoring in a separate thread."""
    try:
        while True:
            agent.logger.info("Starting email monitoring cycle...")
            results = agent.process_complaints()
            agent.logger.info(f"Email monitoring cycle completed: {results}")
            time.sleep(interval_minutes * 60)
    except Exception as e:
        agent.logger.error(f"Error in email monitoring thread: {e}")

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Customer Complaint Triage Agent')
    parser.add_argument('--mode', choices=['api', 'email', 'both', 'dashboard'], default='api',
                       help='Run mode: api (Flask server only), email (monitoring only), both, or dashboard')
    parser.add_argument('--interval', type=int, default=5,
                       help='Interval in minutes for email monitoring (default: 5)')
    parser.add_argument('--max-emails', type=int, default=50,
                       help='Maximum emails to process per cycle (default: 50)')
    parser.add_argument('--port', type=int, default=5000,
                       help='Port for Flask API server (default: 5000)')
    parser.add_argument('--host', default='0.0.0.0',
                       help='Host for Flask API server (default: 0.0.0.0)')
    
    args = parser.parse_args()
    
    try:
        agent = ComplaintTriageAgent()
        
        if args.mode == 'dashboard':
            # Show dashboard data
            dashboard_data = agent.get_dashboard_data()
            print("\n=== COMPLAINT TRIAGE DASHBOARD ===")
            print(f"Last Updated: {dashboard_data.get('last_updated', 'Unknown')}")
            
            analytics = dashboard_data.get('analytics', {})
            print(f"\nTotal Complaints: {analytics.get('total_complaints', 0)}")
            print(f"Recent Complaints (24h): {analytics.get('recent_complaints', 0)}")
            print(f"Average Response Time: {analytics.get('avg_response_days', 0):.2f} days")
            
            print("\nBy Category:")
            for category, count in analytics.get('by_category', {}).items():
                print(f"  {category}: {count}")
            
            print("\nBy Priority:")
            for priority, count in analytics.get('by_priority', {}).items():
                print(f"  {priority}: {count}")
            
            print("\nRecent Complaints:")
            for complaint in dashboard_data.get('recent_complaints', [])[:5]:
                print(f"  #{complaint['id']}: {complaint['category']} - {complaint['priority']} - {complaint['customer_name']}")
            
            return
        
        # Start email monitoring in background thread if needed
        email_thread = None
        if args.mode in ['email', 'both']:
            email_thread = threading.Thread(
                target=run_email_monitoring,
                args=(agent, args.interval),
                daemon=True
            )
            email_thread.start()
            agent.logger.info("Email monitoring started in background thread")
        
        # Start Flask API server if needed
        if args.mode in ['api', 'both']:
            agent.logger.info(f"Starting Flask API server on {args.host}:{args.port}")
            print(f"\n🚀 Flask API Server Starting...")
            print(f"📍 API URL: http://{args.host}:{args.port}")
            print(f"🔍 Health Check: http://{args.host}:{args.port}/api/health")
            print(f"📊 Dashboard API: http://{args.host}:{args.port}/api/dashboard/stats")
            print(f"\n💡 For frontend integration, update your API_BASE_URL to: http://{args.host}:{args.port}/api")
            print(f"\n⏹️  Press Ctrl+C to stop the server")
            
            app.run(debug=False, host=args.host, port=args.port)
        
        elif args.mode == 'email':
            # Email monitoring only - keep main thread alive
            try:
                while True:
                    time.sleep(60)  # Sleep for 1 minute
            except KeyboardInterrupt:
                agent.logger.info("Email monitoring stopped by user")
            
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
