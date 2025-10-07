"""
Configuration management for the Customer Complaint Triage Agent.

This module handles loading environment variables and provides
configuration settings for email, AI services, routing, and database.
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Configuration class for the complaint triage agent."""
    
    def __init__(self):
        """Initialize configuration with environment variables."""
        self._load_email_config()
        self._load_ai_config()
        self._load_routing_config()
        self._load_database_config()
        self._load_slack_config()
    
    def _load_email_config(self) -> None:
        """Load email configuration from environment variables."""
        self.email_address = os.getenv('EMAIL_ADDRESS')
        self.email_password = os.getenv('EMAIL_PASSWORD')
        self.imap_server = os.getenv('IMAP_SERVER', 'imap.gmail.com')
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        
        # Validate required email settings
        if not self.email_address or not self.email_password:
            raise ValueError("EMAIL_ADDRESS and EMAIL_PASSWORD must be set in environment variables")
    
    def _load_ai_config(self) -> None:
        """Load AI service configuration."""
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
        
        if not self.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY must be set in environment variables")
    
    def _load_routing_config(self) -> None:
        """Load team routing configuration."""
        self.billing_team_email = os.getenv('BILLING_TEAM_EMAIL', 'billing@company.com')
        self.tech_team_email = os.getenv('TECH_TEAM_EMAIL', 'tech@company.com')
        self.refunds_team_email = os.getenv('REFUNDS_TEAM_EMAIL', 'refunds@company.com')
        self.delivery_team_email = os.getenv('DELIVERY_TEAM_EMAIL', 'delivery@company.com')
        self.account_team_email = os.getenv('ACCOUNT_TEAM_EMAIL', 'accounts@company.com')
        self.general_team_email = os.getenv('GENERAL_TEAM_EMAIL', 'support@company.com')
        self.manager_email = os.getenv('MANAGER_EMAIL', 'manager@company.com')
        
        # Team mapping for routing
        self.team_mapping = {
            'Billing Issue': self.billing_team_email,
            'Product Defect': self.tech_team_email,
            'Refund Request': self.refunds_team_email,
            'Technical Support': self.tech_team_email,
            'Delivery Problem': self.delivery_team_email,
            'Account Issue': self.account_team_email,
            'General Inquiry': self.general_team_email
        }
    
    def _load_database_config(self) -> None:
        """Load database configuration."""
        self.database_path = os.getenv('DATABASE_PATH', 'complaints.db')
    
    def _load_slack_config(self) -> None:
        """Load Slack configuration (optional)."""
        self.slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL')
    
    def get_team_email(self, category: str) -> str:
        """Get team email for a given complaint category."""
        return self.team_mapping.get(category, self.general_team_email)
    
    def get_config_dict(self) -> Dict[str, Any]:
        """Get configuration as dictionary (excluding sensitive data)."""
        return {
            'email_address': self.email_address,
            'imap_server': self.imap_server,
            'smtp_server': self.smtp_server,
            'smtp_port': self.smtp_port,
            'database_path': self.database_path,
            'team_mapping': self.team_mapping,
            'has_slack_config': bool(self.slack_webhook_url)
        }


# Global configuration instance
config = Config()
