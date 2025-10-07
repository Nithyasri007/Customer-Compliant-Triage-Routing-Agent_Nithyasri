"""
Test suite for the Customer Complaint Triage Agent.

This module contains comprehensive tests for the AI classifier,
email handling, routing logic, and database operations.
"""

import unittest
import json
import tempfile
import os
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

# Add src directory to path for imports
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from ai_classifier import ComplaintClassifier
from database import ComplaintDatabase
from email_handler import EmailHandler
from router import ComplaintRouter
from config import Config


class TestComplaintClassifier(unittest.TestCase):
    """Test cases for the AI complaint classifier."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Mock the Anthropic client
        self.mock_client = Mock()
        with patch('ai_classifier.anthropic.Anthropic', return_value=self.mock_client):
            self.classifier = ComplaintClassifier("test-api-key")
    
    def test_classify_billing_complaint(self):
        """Test classification of billing complaints."""
        email_data = {
            'subject': 'Unusual charge on my account',
            'body': 'I was charged $150 for a service I never ordered. This is unacceptable and I demand a refund immediately.',
            'sender': 'John Doe <john@example.com>',
            'customer_email': 'john@example.com'
        }
        
        # Mock Claude response
        mock_response = Mock()
        mock_response.content = [Mock()]
        mock_response.content[0].text = json.dumps({
            "customer_name": "John Doe",
            "category": "Billing Issue",
            "priority": "High",
            "sentiment": "Frustrated",
            "key_entities": {
                "amount": "$150"
            },
            "summary": "Customer charged for unauthorized service",
            "suggested_action": "Investigate charge and process refund"
        })
        
        self.mock_client.messages.create.return_value = mock_response
        
        result = self.classifier.classify_complaint(email_data)
        
        self.assertEqual(result['category'], 'Billing Issue')
        self.assertEqual(result['priority'], 'High')
        self.assertEqual(result['sentiment'], 'Frustrated')
        self.assertEqual(result['customer_name'], 'John Doe')
        self.assertIn('amount', result['key_entities'])
    
    def test_classify_technical_complaint(self):
        """Test classification of technical complaints."""
        email_data = {
            'subject': 'Website not working',
            'body': 'The login page keeps showing error 500. I cannot access my account for 2 days now.',
            'sender': 'Jane Smith <jane@example.com>',
            'customer_email': 'jane@example.com'
        }
        
        mock_response = Mock()
        mock_response.content = [Mock()]
        mock_response.content[0].text = json.dumps({
            "customer_name": "Jane Smith",
            "category": "Technical Support",
            "priority": "High",
            "sentiment": "Frustrated",
            "key_entities": {},
            "summary": "Website login error preventing account access",
            "suggested_action": "Investigate server error and restore access"
        })
        
        self.mock_client.messages.create.return_value = mock_response
        
        result = self.classifier.classify_complaint(email_data)
        
        self.assertEqual(result['category'], 'Technical Support')
        self.assertEqual(result['priority'], 'High')
    
    def test_fallback_classification(self):
        """Test fallback classification when AI fails."""
        email_data = {
            'subject': 'Billing question',
            'body': 'I have a question about my bill.',
            'sender': 'test@example.com',
            'customer_email': 'test@example.com'
        }
        
        # Mock API failure
        self.mock_client.messages.create.side_effect = Exception("API Error")
        
        result = self.classifier.classify_complaint(email_data)
        
        # Should still return a valid classification
        self.assertIn(result['category'], ['Billing Issue', 'General Inquiry'])
        self.assertIn(result['priority'], ['Urgent', 'High', 'Medium', 'Low'])
        self.assertIn(result['sentiment'], ['Angry', 'Frustrated', 'Neutral', 'Satisfied'])
    
    def test_entity_extraction(self):
        """Test extraction of key entities from email."""
        email_data = {
            'subject': 'Order #12345 issue',
            'body': 'My order #12345 for iPhone 15 was delivered damaged. Please call me at (555) 123-4567.',
            'sender': 'Customer <customer@example.com>',
            'customer_email': 'customer@example.com'
        }
        
        mock_response = Mock()
        mock_response.content = [Mock()]
        mock_response.content[0].text = json.dumps({
            "customer_name": "Customer",
            "category": "Product Defect",
            "priority": "Medium",
            "sentiment": "Frustrated",
            "key_entities": {},
            "summary": "Damaged product delivery",
            "suggested_action": "Process return and replacement"
        })
        
        self.mock_client.messages.create.return_value = mock_response
        
        result = self.classifier.classify_complaint(email_data)
        
        # Check if entities were extracted
        entities = result['key_entities']
        self.assertEqual(entities.get('order_number'), '12345')
        self.assertEqual(entities.get('phone_number'), '(555) 123-4567')


class TestDatabase(unittest.TestCase):
    """Test cases for database operations."""
    
    def setUp(self):
        """Set up test database."""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.db = ComplaintDatabase(self.temp_db.name)
    
    def tearDown(self):
        """Clean up test database."""
        os.unlink(self.temp_db.name)
    
    def test_insert_complaint(self):
        """Test inserting a complaint."""
        complaint_data = {
            'email_id': 'test-email-123',
            'customer_email': 'test@example.com',
            'customer_name': 'Test Customer',
            'subject': 'Test Subject',
            'body': 'Test body content',
            'category': 'General Inquiry',
            'priority': 'Medium',
            'sentiment': 'Neutral',
            'assigned_team': 'General Support Team',
            'key_entities': '{"test": "value"}',
            'summary': 'Test summary',
            'suggested_action': 'Test action'
        }
        
        complaint_id = self.db.insert_complaint(complaint_data)
        self.assertIsInstance(complaint_id, int)
        self.assertGreater(complaint_id, 0)
    
    def test_get_complaint(self):
        """Test retrieving a complaint."""
        # Insert a complaint first
        complaint_data = {
            'email_id': 'test-email-456',
            'customer_email': 'test2@example.com',
            'customer_name': 'Test Customer 2',
            'subject': 'Test Subject 2',
            'body': 'Test body content 2',
            'category': 'Billing Issue',
            'priority': 'High',
            'sentiment': 'Frustrated',
            'assigned_team': 'Billing Team',
            'key_entities': '',
            'summary': 'Test summary 2',
            'suggested_action': 'Test action 2'
        }
        
        complaint_id = self.db.insert_complaint(complaint_data)
        
        # Retrieve the complaint
        retrieved = self.db.get_complaint(complaint_id)
        
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved['customer_email'], 'test2@example.com')
        self.assertEqual(retrieved['category'], 'Billing Issue')
    
    def test_update_status(self):
        """Test updating complaint status."""
        # Insert a complaint
        complaint_data = {
            'email_id': 'test-email-789',
            'customer_email': 'test3@example.com',
            'customer_name': 'Test Customer 3',
            'subject': 'Test Subject 3',
            'body': 'Test body content 3',
            'category': 'Technical Support',
            'priority': 'Medium',
            'sentiment': 'Neutral',
            'assigned_team': 'Technical Team',
            'key_entities': '',
            'summary': 'Test summary 3',
            'suggested_action': 'Test action 3'
        }
        
        complaint_id = self.db.insert_complaint(complaint_data)
        
        # Update status
        success = self.db.update_status(complaint_id, 'In Progress')
        self.assertTrue(success)
        
        # Verify update
        updated = self.db.get_complaint(complaint_id)
        self.assertEqual(updated['status'], 'In Progress')
    
    def test_analytics(self):
        """Test analytics data retrieval."""
        # Insert multiple complaints for testing
        complaints = [
            {
                'email_id': f'test-email-{i}',
                'customer_email': f'test{i}@example.com',
                'customer_name': f'Test Customer {i}',
                'subject': f'Test Subject {i}',
                'body': f'Test body content {i}',
                'category': 'General Inquiry' if i % 2 == 0 else 'Billing Issue',
                'priority': 'High' if i % 3 == 0 else 'Medium',
                'sentiment': 'Neutral',
                'assigned_team': 'General Support Team',
                'key_entities': '',
                'summary': f'Test summary {i}',
                'suggested_action': f'Test action {i}'
            }
            for i in range(5)
        ]
        
        for complaint in complaints:
            self.db.insert_complaint(complaint)
        
        analytics = self.db.get_analytics()
        
        self.assertIn('total_complaints', analytics)
        self.assertIn('by_category', analytics)
        self.assertIn('by_priority', analytics)
        self.assertEqual(analytics['total_complaints'], 5)


class TestEmailHandler(unittest.TestCase):
    """Test cases for email handling."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_config = Mock()
        self.mock_config.email_address = 'test@example.com'
        self.mock_config.email_password = 'test-password'
        self.mock_config.imap_server = 'imap.gmail.com'
        self.mock_config.smtp_server = 'smtp.gmail.com'
        self.mock_config.smtp_port = 587
        
        self.email_handler = EmailHandler(self.mock_config)
    
    def test_extract_email_address(self):
        """Test email address extraction from sender string."""
        test_cases = [
            ('John Doe <john@example.com>', 'john@example.com'),
            ('jane@example.com', 'jane@example.com'),
            ('"Jane Smith" <jane.smith@company.com>', 'jane.smith@company.com'),
            ('test@example.com', 'test@example.com')
        ]
        
        for sender, expected in test_cases:
            result = self.email_handler._extract_email_address(sender)
            self.assertEqual(result, expected)
    
    def test_decode_header(self):
        """Test email header decoding."""
        test_cases = [
            ('Simple subject', 'Simple subject'),
            ('=?UTF-8?B?VGVzdCBzdWJqZWN0?=', 'Test subject'),
            ('', ''),
            (None, '')
        ]
        
        for header, expected in test_cases:
            result = self.email_handler._decode_header(header)
            self.assertEqual(result, expected)
    
    def test_create_acknowledgment_text(self):
        """Test acknowledgment email text creation."""
        complaint_data = {
            'customer_name': 'Test Customer',
            'category': 'Billing Issue',
            'priority': 'High',
            'assigned_team': 'Billing Team',
            'id': 123
        }
        
        text = self.email_handler._create_acknowledgment_text(complaint_data)
        
        self.assertIn('Test Customer', text)
        self.assertIn('Billing Issue', text)
        self.assertIn('High', text)
        self.assertIn('within 4 hours', text)  # High priority response time
        self.assertIn('#123', text)


class TestRouter(unittest.TestCase):
    """Test cases for complaint routing."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.mock_config = Mock()
        self.mock_config.team_mapping = {
            'Billing Issue': 'billing@company.com',
            'Technical Support': 'tech@company.com',
            'General Inquiry': 'support@company.com'
        }
        self.mock_config.manager_email = 'manager@company.com'
        self.mock_config.general_team_email = 'support@company.com'
        
        self.router = ComplaintRouter(self.mock_config)
    
    def test_route_billing_complaint(self):
        """Test routing of billing complaints."""
        complaint_data = {
            'id': 123,
            'category': 'Billing Issue',
            'priority': 'High',
            'customer_name': 'Test Customer',
            'customer_email': 'test@example.com'
        }
        
        result = self.router.route_complaint(complaint_data)
        
        self.assertEqual(result['assigned_team'], 'Billing Team')
        self.assertEqual(result['priority'], 'High')
        self.assertIn('manager', result['escalation_actions'])  # High priority escalates
        self.assertEqual(result['status'], 'routed')
    
    def test_route_general_inquiry(self):
        """Test routing of general inquiries."""
        complaint_data = {
            'id': 124,
            'category': 'General Inquiry',
            'priority': 'Low',
            'customer_name': 'Test Customer',
            'customer_email': 'test@example.com'
        }
        
        result = self.router.route_complaint(complaint_data)
        
        self.assertEqual(result['assigned_team'], 'General Support Team')
        self.assertEqual(result['priority'], 'Low')
        self.assertEqual(result['escalation_actions'], ['team'])  # Low priority only goes to team
        self.assertEqual(result['status'], 'routed')
    
    def test_escalation_rules(self):
        """Test escalation rules for different priorities."""
        priorities = ['Urgent', 'High', 'Medium', 'Low']
        expected_escalations = [
            ['manager', 'team'],
            ['manager'],
            ['team'],
            ['team']
        ]
        
        for priority, expected in zip(priorities, expected_escalations):
            complaint_data = {
                'id': 125,
                'category': 'General Inquiry',
                'priority': priority,
                'customer_name': 'Test Customer',
                'customer_email': 'test@example.com'
            }
            
            result = self.router.route_complaint(complaint_data)
            self.assertEqual(result['escalation_actions'], expected)


class TestIntegration(unittest.TestCase):
    """Integration tests for the complete workflow."""
    
    def setUp(self):
        """Set up integration test fixtures."""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        
        # Mock all external dependencies
        self.mock_config = Mock()
        self.mock_config.database_path = self.temp_db.name
        self.mock_config.email_address = 'test@example.com'
        self.mock_config.email_password = 'test-password'
        self.mock_config.imap_server = 'imap.gmail.com'
        self.mock_config.smtp_server = 'smtp.gmail.com'
        self.mock_config.smtp_port = 587
        self.mock_config.anthropic_api_key = 'test-api-key'
        self.mock_config.team_mapping = {
            'Billing Issue': 'billing@company.com',
            'Technical Support': 'tech@company.com',
            'General Inquiry': 'support@company.com'
        }
        self.mock_config.manager_email = 'manager@company.com'
        self.mock_config.general_team_email = 'support@company.com'
    
    def tearDown(self):
        """Clean up integration test fixtures."""
        os.unlink(self.temp_db.name)
    
    @patch('ai_classifier.anthropic.Anthropic')
    def test_end_to_end_workflow(self, mock_anthropic):
        """Test complete end-to-end workflow."""
        # Mock AI classifier
        mock_client = Mock()
        mock_anthropic.return_value = mock_client
        
        mock_response = Mock()
        mock_response.content = [Mock()]
        mock_response.content[0].text = json.dumps({
            "customer_name": "Integration Test",
            "category": "Billing Issue",
            "priority": "High",
            "sentiment": "Frustrated",
            "key_entities": {"amount": "$100"},
            "summary": "Test billing complaint",
            "suggested_action": "Process refund"
        })
        mock_client.messages.create.return_value = mock_response
        
        # Initialize components
        db = ComplaintDatabase(self.temp_db.name)
        classifier = ComplaintClassifier("test-api-key")
        router = ComplaintRouter(self.mock_config)
        
        # Test data
        email_data = {
            'email_id': 'integration-test-123',
            'subject': 'Billing issue',
            'body': 'I was charged $100 incorrectly',
            'sender': 'Integration Test <test@example.com>',
            'customer_email': 'test@example.com'
        }
        
        # Step 1: Classify
        classification = classifier.classify_complaint(email_data)
        self.assertEqual(classification['category'], 'Billing Issue')
        
        # Step 2: Store in database
        complaint_data = {**email_data, **classification}
        complaint_id = db.insert_complaint(complaint_data)
        complaint_data['id'] = complaint_id
        
        # Step 3: Route
        routing_result = router.route_complaint(complaint_data)
        self.assertEqual(routing_result['assigned_team'], 'Billing Team')
        
        # Step 4: Verify in database
        stored = db.get_complaint(complaint_id)
        self.assertIsNotNone(stored)
        self.assertEqual(stored['category'], 'Billing Issue')
        self.assertEqual(stored['priority'], 'High')


if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)
