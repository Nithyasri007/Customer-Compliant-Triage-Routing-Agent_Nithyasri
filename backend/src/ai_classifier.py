"""
AI-powered complaint classification module.

This module uses Anthropic's Claude API to analyze customer complaints,
extract metadata, classify categories, determine priority, and provide
structured output for the triage system.
"""

import json
import logging
import re
from typing import Dict, Any, Optional
import anthropic

logger = logging.getLogger(__name__)


class ComplaintClassifier:
    """AI-powered complaint classifier using Anthropic Claude."""
    
    def __init__(self, api_key: str):
        """
        Initialize the complaint classifier.
        
        Args:
            api_key: Anthropic API key
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.system_prompt = self._get_system_prompt()
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for Claude."""
        return """You are a customer complaint triage specialist. Analyze the complaint and return a JSON object with:

{
  "customer_name": "extracted name or 'Unknown'",
  "category": "one of: Billing Issue, Product Defect, Refund Request, Technical Support, Delivery Problem, Account Issue, General Inquiry",
  "priority": "one of: Urgent, High, Medium, Low",
  "sentiment": "one of: Angry, Frustrated, Neutral, Satisfied",
  "key_entities": {
    "order_number": "if mentioned",
    "product_name": "if mentioned",
    "amount": "if mentioned",
    "phone_number": "if mentioned",
    "account_number": "if mentioned"
  },
  "summary": "one-sentence summary of the issue",
  "suggested_action": "brief recommendation for the team"
}

Priority Rules:
- Urgent: Angry sentiment + keywords like "immediately", "unacceptable", "lawyer", "sue", "legal action", "financial loss", "fraud"
- High: Frustrated sentiment + time-sensitive issues, "broken", "not working", "urgent", "asap"
- Medium: Neutral requests with clear issues, standard complaints
- Low: General inquiries, satisfied customers seeking info, minor questions

Category Rules:
- Billing Issue: charges, payment, invoice, billing, subscription, fees
- Product Defect: broken, defective, malfunction, not working, quality issue
- Refund Request: refund, return, cancel, money back
- Technical Support: technical problem, bug, error, login issue, software
- Delivery Problem: shipping, delivery, late, missing, wrong address
- Account Issue: account access, password, profile, settings
- General Inquiry: questions, information, how-to, general help

Be objective and professional. Extract all relevant information accurately."""
    
    def classify_complaint(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify a complaint using AI.
        
        Args:
            email_data: Email data containing subject and body
            
        Returns:
            Dictionary containing classification results
        """
        try:
            # Prepare the input text for analysis
            input_text = self._prepare_input_text(email_data)
            
            # Call Claude API
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                system=self.system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": input_text
                    }
                ]
            )
            
            # Parse the response
            classification_result = self._parse_claude_response(response.content[0].text)
            
            # Enhance with additional analysis
            classification_result = self._enhance_classification(classification_result, email_data)
            
            logger.info(f"Successfully classified complaint: {classification_result['category']} - {classification_result['priority']}")
            return classification_result
            
        except Exception as e:
            logger.error(f"Error classifying complaint: {e}")
            return self._get_fallback_classification(email_data)
    
    def _prepare_input_text(self, email_data: Dict[str, Any]) -> str:
        """
        Prepare input text for Claude analysis.
        
        Args:
            email_data: Email data
            
        Returns:
            Formatted input text
        """
        subject = email_data.get('subject', 'No subject')
        body = email_data.get('body', 'No body')
        sender = email_data.get('sender', 'Unknown sender')
        
        # Clean and truncate body if too long
        if len(body) > 3000:
            body = body[:3000] + "... [truncated]"
        
        input_text = f"""
Subject: {subject}

From: {sender}

Body:
{body}

Please analyze this customer complaint and provide the JSON classification.
"""
        return input_text.strip()
    
    def _parse_claude_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse Claude's response and extract JSON.
        
        Args:
            response_text: Raw response from Claude
            
        Returns:
            Parsed classification result
        """
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                result = json.loads(json_str)
                
                # Validate required fields
                required_fields = ['category', 'priority', 'sentiment']
                for field in required_fields:
                    if field not in result:
                        result[field] = 'Unknown'
                
                # Ensure key_entities is a dict
                if 'key_entities' not in result or not isinstance(result['key_entities'], dict):
                    result['key_entities'] = {}
                
                return result
            else:
                logger.warning("No JSON found in Claude response")
                return self._get_default_classification()
                
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON from Claude response: {e}")
            return self._get_default_classification()
    
    def _enhance_classification(self, classification: Dict[str, Any], email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance classification with additional analysis.
        
        Args:
            classification: Base classification result
            email_data: Original email data
            
        Returns:
            Enhanced classification result
        """
        # Extract customer email
        classification['customer_email'] = email_data.get('customer_email', '')
        
        # Extract customer name from sender if not found by AI
        if classification.get('customer_name') == 'Unknown':
            classification['customer_name'] = self._extract_name_from_sender(email_data.get('sender', ''))
        
        # Validate category
        valid_categories = [
            'Billing Issue', 'Product Defect', 'Refund Request', 
            'Technical Support', 'Delivery Problem', 'Account Issue', 'General Inquiry'
        ]
        if classification.get('category') not in valid_categories:
            classification['category'] = 'General Inquiry'
        
        # Validate priority
        valid_priorities = ['Urgent', 'High', 'Medium', 'Low']
        if classification.get('priority') not in valid_priorities:
            classification['priority'] = 'Medium'
        
        # Validate sentiment
        valid_sentiments = ['Angry', 'Frustrated', 'Neutral', 'Satisfied']
        if classification.get('sentiment') not in valid_sentiments:
            classification['sentiment'] = 'Neutral'
        
        # Additional entity extraction
        classification['key_entities'] = self._extract_additional_entities(
            email_data, classification.get('key_entities', {})
        )
        
        return classification
    
    def _extract_name_from_sender(self, sender: str) -> str:
        """
        Extract name from sender string.
        
        Args:
            sender: Sender string
            
        Returns:
            Extracted name or 'Unknown'
        """
        # Remove email address and clean up
        name = re.sub(r'<[^>]+>', '', sender).strip()
        name = re.sub(r'"[^"]*"', '', name).strip()
        
        # Remove common prefixes
        name = re.sub(r'^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*', '', name, flags=re.IGNORECASE)
        
        if name and len(name) > 2:
            return name
        return 'Unknown'
    
    def _extract_additional_entities(self, email_data: Dict[str, Any], existing_entities: Dict[str, str]) -> Dict[str, str]:
        """
        Extract additional entities using regex patterns.
        
        Args:
            email_data: Email data
            existing_entities: Existing entities from AI
            
        Returns:
            Enhanced entities dictionary
        """
        text = f"{email_data.get('subject', '')} {email_data.get('body', '')}"
        
        entities = existing_entities.copy()
        
        # Extract order numbers (various patterns)
        order_patterns = [
            r'order\s*#?\s*(\w+)',
            r'order\s*number\s*:?\s*(\w+)',
            r'#(\w{6,})',
            r'ref\s*:?\s*(\w+)'
        ]
        
        for pattern in order_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match and not entities.get('order_number'):
                entities['order_number'] = match.group(1)
                break
        
        # Extract phone numbers
        phone_pattern = r'(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})'
        phone_match = re.search(phone_pattern, text)
        if phone_match and not entities.get('phone_number'):
            entities['phone_number'] = phone_match.group(1)
        
        # Extract amounts
        amount_pattern = r'\$(\d+(?:\.\d{2})?)'
        amount_match = re.search(amount_pattern, text)
        if amount_match and not entities.get('amount'):
            entities['amount'] = f"${amount_match.group(1)}"
        
        return entities
    
    def _get_fallback_classification(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get fallback classification when AI fails.
        
        Args:
            email_data: Email data
            
        Returns:
            Fallback classification result
        """
        logger.warning("Using fallback classification")
        
        text = f"{email_data.get('subject', '')} {email_data.get('body', '')}".lower()
        
        # Simple keyword-based classification
        category = 'General Inquiry'
        if any(word in text for word in ['bill', 'charge', 'payment', 'invoice', 'subscription']):
            category = 'Billing Issue'
        elif any(word in text for word in ['broken', 'defective', 'not working', 'malfunction']):
            category = 'Product Defect'
        elif any(word in text for word in ['refund', 'return', 'cancel', 'money back']):
            category = 'Refund Request'
        elif any(word in text for word in ['technical', 'bug', 'error', 'login', 'password']):
            category = 'Technical Support'
        elif any(word in text for word in ['delivery', 'shipping', 'late', 'missing']):
            category = 'Delivery Problem'
        elif any(word in text for word in ['account', 'profile', 'settings']):
            category = 'Account Issue'
        
        # Simple priority detection
        priority = 'Medium'
        if any(word in text for word in ['urgent', 'immediately', 'asap', 'critical']):
            priority = 'Urgent'
        elif any(word in text for word in ['broken', 'not working', 'frustrated', 'angry']):
            priority = 'High'
        elif any(word in text for word in ['question', 'info', 'help']):
            priority = 'Low'
        
        # Simple sentiment detection
        sentiment = 'Neutral'
        if any(word in text for word in ['angry', 'furious', 'unacceptable', 'terrible']):
            sentiment = 'Angry'
        elif any(word in text for word in ['frustrated', 'annoying', 'disappointed']):
            sentiment = 'Frustrated'
        elif any(word in text for word in ['thank', 'good', 'satisfied', 'happy']):
            sentiment = 'Satisfied'
        
        return {
            'customer_name': self._extract_name_from_sender(email_data.get('sender', '')),
            'customer_email': email_data.get('customer_email', ''),
            'category': category,
            'priority': priority,
            'sentiment': sentiment,
            'key_entities': self._extract_additional_entities(email_data, {}),
            'summary': f"Customer complaint regarding {category.lower()}",
            'suggested_action': "Review complaint and respond appropriately"
        }
    
    def _get_default_classification(self) -> Dict[str, Any]:
        """Get default classification when parsing fails."""
        return {
            'customer_name': 'Unknown',
            'customer_email': '',
            'category': 'General Inquiry',
            'priority': 'Medium',
            'sentiment': 'Neutral',
            'key_entities': {},
            'summary': 'Unable to analyze complaint content',
            'suggested_action': 'Manual review required'
        }
    
    def batch_classify(self, email_list: list[Dict[str, Any]]) -> list[Dict[str, Any]]:
        """
        Classify multiple complaints in batch.
        
        Args:
            email_list: List of email data dictionaries
            
        Returns:
            List of classification results
        """
        results = []
        
        for i, email_data in enumerate(email_list):
            try:
                logger.info(f"Classifying complaint {i+1}/{len(email_list)}")
                result = self.classify_complaint(email_data)
                results.append(result)
            except Exception as e:
                logger.error(f"Error classifying complaint {i+1}: {e}")
                results.append(self._get_fallback_classification(email_data))
        
        return results
