"""
Email handling module for the Customer Complaint Triage Agent.

This module handles IMAP email reading, SMTP email sending,
and email parsing functionality.
"""

import imaplib
import smtplib
import email
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import decode_header
from typing import List, Dict, Any, Optional
from datetime import datetime
import re

logger = logging.getLogger(__name__)


class EmailHandler:
    """Handles email operations including reading and sending emails."""
    
    def __init__(self, config):
        """
        Initialize email handler with configuration.
        
        Args:
            config: Configuration object containing email settings
        """
        self.config = config
        self.email_address = config.email_address
        self.email_password = config.email_password
        self.imap_server = config.imap_server
        self.smtp_server = config.smtp_server
        self.smtp_port = config.smtp_port
    
    def connect_imap(self) -> imaplib.IMAP4_SSL:
        """
        Connect to IMAP server.
        
        Returns:
            Connected IMAP4_SSL instance
            
        Raises:
            Exception: If connection fails
        """
        try:
            mail = imaplib.IMAP4_SSL(self.imap_server)
            mail.login(self.email_address, self.email_password)
            logger.info("Successfully connected to IMAP server")
            return mail
        except Exception as e:
            logger.error(f"Failed to connect to IMAP server: {e}")
            raise
    
    def connect_smtp(self) -> smtplib.SMTP:
        """
        Connect to SMTP server.
        
        Returns:
            Connected SMTP instance
            
        Raises:
            Exception: If connection fails
        """
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_address, self.email_password)
            logger.info("Successfully connected to SMTP server")
            return server
        except Exception as e:
            logger.error(f"Failed to connect to SMTP server: {e}")
            raise
    
    def get_unread_emails(self, folder: str = 'INBOX') -> List[Dict[str, Any]]:
        """
        Retrieve unread emails from specified folder.
        
        Args:
            folder: Email folder to check (default: 'INBOX')
            
        Returns:
            List of unread email dictionaries
        """
        emails = []
        mail = None
        
        try:
            mail = self.connect_imap()
            mail.select(folder)
            
            # Search for unread emails
            status, messages = mail.search(None, 'UNSEEN')
            if status != 'OK':
                logger.error("Failed to search for unread emails")
                return emails
            
            email_ids = messages[0].split()
            logger.info(f"Found {len(email_ids)} unread emails")
            
            for email_id in email_ids:
                try:
                    email_data = self._fetch_email(mail, email_id)
                    if email_data:
                        emails.append(email_data)
                except Exception as e:
                    logger.error(f"Error processing email {email_id}: {e}")
                    continue
            
        except Exception as e:
            logger.error(f"Error retrieving unread emails: {e}")
        finally:
            if mail:
                mail.close()
                mail.logout()
        
        return emails
    
    def _fetch_email(self, mail: imaplib.IMAP4_SSL, email_id: bytes) -> Optional[Dict[str, Any]]:
        """
        Fetch and parse a single email.
        
        Args:
            mail: IMAP connection
            email_id: Email ID to fetch
            
        Returns:
            Parsed email dictionary or None if error
        """
        try:
            status, msg_data = mail.fetch(email_id, '(RFC822)')
            if status != 'OK':
                return None
            
            raw_email = msg_data[0][1]
            email_message = email.message_from_bytes(raw_email)
            
            # Parse email headers
            subject = self._decode_header(email_message.get('Subject', ''))
            sender = self._decode_header(email_message.get('From', ''))
            date_str = email_message.get('Date', '')
            message_id = email_message.get('Message-ID', '')
            
            # Parse email body
            body = self._extract_body(email_message)
            
            # Extract customer email from sender
            customer_email = self._extract_email_address(sender)
            
            return {
                'email_id': message_id,
                'subject': subject,
                'sender': sender,
                'customer_email': customer_email,
                'body': body,
                'date': date_str,
                'raw_email': raw_email,
                'internal_id': email_id.decode()
            }
        
        except Exception as e:
            logger.error(f"Error parsing email {email_id}: {e}")
            return None
    
    def _decode_header(self, header_value: str) -> str:
        """
        Decode email header value.
        
        Args:
            header_value: Header value to decode
            
        Returns:
            Decoded header value
        """
        if not header_value:
            return ''
        
        try:
            decoded_parts = decode_header(header_value)
            decoded_string = ''
            
            for part, encoding in decoded_parts:
                if isinstance(part, bytes):
                    if encoding:
                        decoded_string += part.decode(encoding)
                    else:
                        decoded_string += part.decode('utf-8', errors='ignore')
                else:
                    decoded_string += part
            
            return decoded_string
        except Exception as e:
            logger.error(f"Error decoding header: {e}")
            return header_value
    
    def _extract_body(self, email_message) -> str:
        """
        Extract text body from email message.
        
        Args:
            email_message: Email message object
            
        Returns:
            Extracted text body
        """
        body = ''
        
        if email_message.is_multipart():
            for part in email_message.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get('Content-Disposition'))
                
                if content_type == 'text/plain' and 'attachment' not in content_disposition:
                    try:
                        body += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    except Exception as e:
                        logger.error(f"Error decoding email part: {e}")
                        continue
        else:
            content_type = email_message.get_content_type()
            if content_type == 'text/plain':
                try:
                    body = email_message.get_payload(decode=True).decode('utf-8', errors='ignore')
                except Exception as e:
                    logger.error(f"Error decoding email body: {e}")
                    body = str(email_message.get_payload())
        
        return body.strip()
    
    def _extract_email_address(self, sender_string: str) -> str:
        """
        Extract email address from sender string.
        
        Args:
            sender_string: Sender string (e.g., "John Doe <john@example.com>")
            
        Returns:
            Extracted email address
        """
        # Regular expression to match email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(email_pattern, sender_string)
        
        if matches:
            return matches[0]
        
        # If no email found in angle brackets, return the whole string if it looks like an email
        if '@' in sender_string and '.' in sender_string:
            return sender_string.strip()
        
        return sender_string
    
    def mark_as_read(self, email_id: str, folder: str = 'INBOX') -> bool:
        """
        Mark an email as read.
        
        Args:
            email_id: Internal email ID
            folder: Email folder
            
        Returns:
            True if successful, False otherwise
        """
        mail = None
        try:
            mail = self.connect_imap()
            mail.select(folder)
            
            mail.store(email_id.encode(), '+FLAGS', '\\Seen')
            logger.info(f"Marked email {email_id} as read")
            return True
            
        except Exception as e:
            logger.error(f"Error marking email as read: {e}")
            return False
        finally:
            if mail:
                mail.close()
                mail.logout()
    
    def send_acknowledgment_email(self, customer_email: str, complaint_data: Dict[str, Any]) -> bool:
        """
        Send acknowledgment email to customer.
        
        Args:
            customer_email: Customer's email address
            complaint_data: Complaint data for personalization
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.email_address
            msg['To'] = customer_email
            msg['Subject'] = f"Re: {complaint_data.get('subject', 'Your Complaint')}"
            
            # Create acknowledgment text
            acknowledgment_text = self._create_acknowledgment_text(complaint_data)
            
            # Add text part
            text_part = MIMEText(acknowledgment_text, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # Send email
            server = self.connect_smtp()
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Sent acknowledgment email to {customer_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending acknowledgment email: {e}")
            return False
    
    def _create_acknowledgment_text(self, complaint_data: Dict[str, Any]) -> str:
        """
        Create acknowledgment email text.
        
        Args:
            complaint_data: Complaint data for personalization
            
        Returns:
            Acknowledgment email text
        """
        customer_name = complaint_data.get('customer_name', 'Valued Customer')
        category = complaint_data.get('category', 'your inquiry')
        priority = complaint_data.get('priority', 'Medium')
        assigned_team = complaint_data.get('assigned_team', 'our support team')
        
        # Determine response time based on priority
        response_times = {
            'Urgent': 'within 2 hours',
            'High': 'within 4 hours',
            'Medium': 'within 24 hours',
            'Low': 'within 48 hours'
        }
        response_time = response_times.get(priority, 'within 24 hours')
        
        acknowledgment = f"""
Dear {customer_name},

Thank you for contacting us regarding {category.lower()}. We have received your message and want to assure you that we take all customer concerns seriously.

Your complaint has been:
- Categorized as: {category}
- Priority Level: {priority}
- Assigned to: {assigned_team}

We will respond to your inquiry {response_time} during business hours.

Your complaint reference: #{complaint_data.get('id', 'TBD')}

If you have any additional information or urgent concerns, please reply to this email or contact us directly.

Thank you for your patience and for choosing our services.

Best regards,
Customer Service Team
"""
        return acknowledgment.strip()
    
    def send_team_notification(self, team_email: str, complaint_data: Dict[str, Any]) -> bool:
        """
        Send notification email to assigned team.
        
        Args:
            team_email: Team email address
            complaint_data: Complaint data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['From'] = self.email_address
            msg['To'] = team_email
            msg['Subject'] = f"New {complaint_data.get('priority', 'Medium')} Priority Complaint - #{complaint_data.get('id', 'TBD')}"
            
            notification_text = self._create_team_notification_text(complaint_data)
            
            text_part = MIMEText(notification_text, 'plain', 'utf-8')
            msg.attach(text_part)
            
            server = self.connect_smtp()
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Sent team notification to {team_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending team notification: {e}")
            return False
    
    def _create_team_notification_text(self, complaint_data: Dict[str, Any]) -> str:
        """
        Create team notification email text.
        
        Args:
            complaint_data: Complaint data
            
        Returns:
            Team notification email text
        """
        notification = f"""
NEW CUSTOMER COMPLAINT ASSIGNED

Complaint ID: #{complaint_data.get('id', 'TBD')}
Priority: {complaint_data.get('priority', 'Medium')}
Category: {complaint_data.get('category', 'Unknown')}
Sentiment: {complaint_data.get('sentiment', 'Neutral')}

Customer Details:
- Name: {complaint_data.get('customer_name', 'Unknown')}
- Email: {complaint_data.get('customer_email', 'Unknown')}

Subject: {complaint_data.get('subject', 'No subject')}

Complaint Summary:
{complaint_data.get('summary', 'No summary available')}

Suggested Action:
{complaint_data.get('suggested_action', 'Review and respond appropriately')}

Key Entities:
{complaint_data.get('key_entities', 'None identified')}

Full Complaint Body:
{complaint_data.get('body', 'No body content')[:500]}{'...' if len(complaint_data.get('body', '')) > 500 else ''}

Please respond promptly based on the priority level.
"""
        return notification.strip()
