"""
Routing logic for the Customer Complaint Triage Agent.

This module handles routing complaints to appropriate teams based on
category, priority, and escalation rules.
"""

import logging
import requests
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class ComplaintRouter:
    """Handles routing of complaints to appropriate teams."""
    
    def __init__(self, config):
        """
        Initialize the complaint router.
        
        Args:
            config: Configuration object containing routing settings
        """
        self.config = config
        self.team_mapping = config.team_mapping
        self.manager_email = config.manager_email
        self.slack_webhook_url = config.slack_webhook_url
        
        # Escalation rules
        self.escalation_rules = {
            'Urgent': ['manager', 'team'],
            'High': ['manager'],
            'Medium': ['team'],
            'Low': ['team']
        }
    
    def route_complaint(self, complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route a complaint to the appropriate team(s).
        
        Args:
            complaint_data: Complaint data including classification
            
        Returns:
            Routing result with assigned team and actions taken
        """
        try:
            category = complaint_data.get('category', 'General Inquiry')
            priority = complaint_data.get('priority', 'Medium')
            complaint_id = complaint_data.get('id')
            
            # Determine assigned team
            assigned_team = self._determine_assigned_team(category)
            complaint_data['assigned_team'] = assigned_team
            
            # Determine escalation actions
            escalation_actions = self._determine_escalation_actions(priority)
            
            # Prepare routing result
            routing_result = {
                'complaint_id': complaint_id,
                'assigned_team': assigned_team,
                'team_email': self.config.get_team_email(category),
                'priority': priority,
                'escalation_actions': escalation_actions,
                'routing_timestamp': datetime.now().isoformat(),
                'status': 'routed'
            }
            
            logger.info(f"Routed complaint {complaint_id} to {assigned_team} with priority {priority}")
            return routing_result
            
        except Exception as e:
            logger.error(f"Error routing complaint: {e}")
            return self._get_fallback_routing(complaint_data)
    
    def _determine_assigned_team(self, category: str) -> str:
        """
        Determine the assigned team based on category.
        
        Args:
            category: Complaint category
            
        Returns:
            Assigned team name
        """
        team_mapping = {
            'Billing Issue': 'Billing Team',
            'Product Defect': 'Technical Team',
            'Refund Request': 'Refunds Team',
            'Technical Support': 'Technical Team',
            'Delivery Problem': 'Delivery Team',
            'Account Issue': 'Account Team',
            'General Inquiry': 'General Support Team'
        }
        
        return team_mapping.get(category, 'General Support Team')
    
    def _determine_escalation_actions(self, priority: str) -> list[str]:
        """
        Determine escalation actions based on priority.
        
        Args:
            priority: Complaint priority
            
        Returns:
            List of escalation actions
        """
        return self.escalation_rules.get(priority, ['team'])
    
    def send_team_notification(self, routing_result: Dict[str, Any], complaint_data: Dict[str, Any], email_handler) -> bool:
        """
        Send notification to assigned team.
        
        Args:
            routing_result: Routing result from route_complaint
            complaint_data: Full complaint data
            email_handler: Email handler instance
            
        Returns:
            True if notification sent successfully
        """
        try:
            team_email = routing_result['team_email']
            
            # Send email notification
            email_sent = email_handler.send_team_notification(team_email, complaint_data)
            
            # Send Slack notification if configured and high priority
            slack_sent = False
            if self.slack_webhook_url and routing_result['priority'] in ['Urgent', 'High']:
                slack_sent = self._send_slack_notification(routing_result, complaint_data)
            
            # Send escalation notifications
            escalation_sent = self._send_escalation_notifications(routing_result, complaint_data, email_handler)
            
            logger.info(f"Notifications sent - Email: {email_sent}, Slack: {slack_sent}, Escalation: {escalation_sent}")
            return email_sent
            
        except Exception as e:
            logger.error(f"Error sending team notification: {e}")
            return False
    
    def _send_slack_notification(self, routing_result: Dict[str, Any], complaint_data: Dict[str, Any]) -> bool:
        """
        Send Slack notification for high-priority complaints.
        
        Args:
            routing_result: Routing result
            complaint_data: Complaint data
            
        Returns:
            True if Slack notification sent successfully
        """
        try:
            if not self.slack_webhook_url:
                return False
            
            # Prepare Slack message
            priority_emoji = {
                'Urgent': '🚨',
                'High': '⚠️',
                'Medium': '📋',
                'Low': 'ℹ️'
            }
            
            emoji = priority_emoji.get(routing_result['priority'], '📋')
            
            slack_message = {
                "text": f"{emoji} New {routing_result['priority']} Priority Complaint",
                "attachments": [
                    {
                        "color": self._get_priority_color(routing_result['priority']),
                        "fields": [
                            {
                                "title": "Complaint ID",
                                "value": f"#{complaint_data.get('id', 'TBD')}",
                                "short": True
                            },
                            {
                                "title": "Category",
                                "value": complaint_data.get('category', 'Unknown'),
                                "short": True
                            },
                            {
                                "title": "Priority",
                                "value": routing_result['priority'],
                                "short": True
                            },
                            {
                                "title": "Assigned Team",
                                "value": routing_result['assigned_team'],
                                "short": True
                            },
                            {
                                "title": "Customer",
                                "value": f"{complaint_data.get('customer_name', 'Unknown')} ({complaint_data.get('customer_email', 'Unknown')})",
                                "short": False
                            },
                            {
                                "title": "Summary",
                                "value": complaint_data.get('summary', 'No summary available')[:200],
                                "short": False
                            }
                        ],
                        "footer": "Complaint Triage Agent",
                        "ts": int(datetime.now().timestamp())
                    }
                ]
            }
            
            # Send to Slack
            response = requests.post(
                self.slack_webhook_url,
                json=slack_message,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info("Slack notification sent successfully")
                return True
            else:
                logger.error(f"Slack notification failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending Slack notification: {e}")
            return False
    
    def _get_priority_color(self, priority: str) -> str:
        """
        Get color code for priority in Slack.
        
        Args:
            priority: Priority level
            
        Returns:
            Hex color code
        """
        colors = {
            'Urgent': 'danger',
            'High': 'warning',
            'Medium': 'good',
            'Low': '#36a64f'
        }
        return colors.get(priority, 'good')
    
    def _send_escalation_notifications(self, routing_result: Dict[str, Any], complaint_data: Dict[str, Any], email_handler) -> bool:
        """
        Send escalation notifications to managers.
        
        Args:
            routing_result: Routing result
            complaint_data: Complaint data
            email_handler: Email handler instance
            
        Returns:
            True if escalation sent successfully
        """
        try:
            escalation_actions = routing_result.get('escalation_actions', [])
            
            if 'manager' in escalation_actions:
                # Send manager notification
                manager_notification = self._create_manager_notification(routing_result, complaint_data)
                
                # Send via email
                success = email_handler.send_team_notification(self.manager_email, complaint_data)
                
                if success:
                    logger.info("Manager escalation notification sent")
                    return True
                else:
                    logger.error("Failed to send manager escalation notification")
                    return False
            
            return True  # No escalation needed
            
        except Exception as e:
            logger.error(f"Error sending escalation notifications: {e}")
            return False
    
    def _create_manager_notification(self, routing_result: Dict[str, Any], complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create manager notification data.
        
        Args:
            routing_result: Routing result
            complaint_data: Complaint data
            
        Returns:
            Manager notification data
        """
        return {
            **complaint_data,
            'subject': f"ESCALATION: {routing_result['priority']} Priority Complaint - #{complaint_data.get('id', 'TBD')}",
            'escalation_reason': f"Complaint escalated due to {routing_result['priority']} priority level",
            'assigned_team': 'Management'
        }
    
    def _get_fallback_routing(self, complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get fallback routing when main routing fails.
        
        Args:
            complaint_data: Complaint data
            
        Returns:
            Fallback routing result
        """
        logger.warning("Using fallback routing")
        
        return {
            'complaint_id': complaint_data.get('id'),
            'assigned_team': 'General Support Team',
            'team_email': self.config.general_team_email,
            'priority': 'Medium',
            'escalation_actions': ['team'],
            'routing_timestamp': datetime.now().isoformat(),
            'status': 'routed_fallback'
        }
    
    def get_routing_analytics(self, database) -> Dict[str, Any]:
        """
        Get routing analytics from database.
        
        Args:
            database: Database instance
            
        Returns:
            Routing analytics data
        """
        try:
            analytics = database.get_analytics()
            
            routing_analytics = {
                'total_complaints': analytics.get('total_complaints', 0),
                'by_team': analytics.get('by_team', {}),
                'by_priority': analytics.get('by_priority', {}),
                'by_category': analytics.get('by_category', {}),
                'avg_response_days': analytics.get('avg_response_days', 0),
                'recent_complaints': analytics.get('recent_complaints', 0)
            }
            
            return routing_analytics
            
        except Exception as e:
            logger.error(f"Error getting routing analytics: {e}")
            return {}
    
    def update_routing_rules(self, new_rules: Dict[str, Any]) -> bool:
        """
        Update routing rules (for future enhancement).
        
        Args:
            new_rules: New routing rules
            
        Returns:
            True if rules updated successfully
        """
        try:
            # This would be implemented for dynamic rule updates
            logger.info("Routing rules update requested")
            return True
            
        except Exception as e:
            logger.error(f"Error updating routing rules: {e}")
            return False
