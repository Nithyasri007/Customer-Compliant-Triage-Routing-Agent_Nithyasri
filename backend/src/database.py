"""
Database operations for the Customer Complaint Triage Agent.

This module handles SQLite database operations including creating tables,
inserting complaints, updating status, and retrieving analytics.
"""

import sqlite3
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class ComplaintDatabase:
    """Database handler for complaint storage and retrieval."""
    
    def __init__(self, database_path: str):
        """
        Initialize database connection.
        
        Args:
            database_path: Path to SQLite database file
        """
        self.database_path = database_path
        self._create_tables()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.database_path)
        conn.row_factory = sqlite3.Row  # Enable dict-like access
        try:
            yield conn
        finally:
            conn.close()
    
    def _create_tables(self) -> None:
        """Create database tables if they don't exist."""
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id TEXT UNIQUE NOT NULL,
            customer_email TEXT NOT NULL,
            customer_name TEXT,
            subject TEXT NOT NULL,
            body TEXT NOT NULL,
            category TEXT NOT NULL,
            priority TEXT NOT NULL,
            sentiment TEXT,
            assigned_team TEXT NOT NULL,
            status TEXT DEFAULT 'New',
            key_entities TEXT,
            summary TEXT,
            suggested_action TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        with self.get_connection() as conn:
            conn.execute(create_table_sql)
            conn.commit()
            logger.info("Database tables created/verified successfully")
    
    def insert_complaint(self, complaint_data: Dict[str, Any]) -> int:
        """
        Insert a new complaint into the database.
        
        Args:
            complaint_data: Dictionary containing complaint information
            
        Returns:
            ID of the inserted complaint
        """
        insert_sql = """
        INSERT INTO complaints (
            email_id, customer_email, customer_name, subject, body,
            category, priority, sentiment, assigned_team, key_entities,
            summary, suggested_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(insert_sql, (
                    complaint_data['email_id'],
                    complaint_data['customer_email'],
                    complaint_data.get('customer_name'),
                    complaint_data['subject'],
                    complaint_data['body'],
                    complaint_data['category'],
                    complaint_data['priority'],
                    complaint_data.get('sentiment'),
                    complaint_data['assigned_team'],
                    complaint_data.get('key_entities', ''),
                    complaint_data.get('summary', ''),
                    complaint_data.get('suggested_action', '')
                ))
                conn.commit()
                complaint_id = cursor.lastrowid
                logger.info(f"Complaint inserted with ID: {complaint_id}")
                return complaint_id
        except sqlite3.IntegrityError as e:
            logger.error(f"Duplicate complaint detected: {e}")
            raise ValueError("Complaint with this email ID already exists")
        except Exception as e:
            logger.error(f"Error inserting complaint: {e}")
            raise
    
    def get_complaint(self, complaint_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieve a complaint by ID.
        
        Args:
            complaint_id: ID of the complaint to retrieve
            
        Returns:
            Dictionary containing complaint data or None if not found
        """
        select_sql = "SELECT * FROM complaints WHERE id = ?"
        
        with self.get_connection() as conn:
            cursor = conn.execute(select_sql, (complaint_id,))
            row = cursor.fetchone()
            
            if row:
                return dict(row)
            return None
    
    def get_complaint_by_email_id(self, email_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a complaint by email ID.
        
        Args:
            email_id: Email ID to search for
            
        Returns:
            Dictionary containing complaint data or None if not found
        """
        select_sql = "SELECT * FROM complaints WHERE email_id = ?"
        
        with self.get_connection() as conn:
            cursor = conn.execute(select_sql, (email_id,))
            row = cursor.fetchone()
            
            if row:
                return dict(row)
            return None
    
    def update_status(self, complaint_id: int, status: str, 
                     assigned_team: Optional[str] = None) -> bool:
        """
        Update complaint status and optionally assigned team.
        
        Args:
            complaint_id: ID of the complaint to update
            status: New status
            assigned_team: New assigned team (optional)
            
        Returns:
            True if update successful, False otherwise
        """
        update_sql = """
        UPDATE complaints 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        """
        params = [status]
        
        if assigned_team:
            update_sql += ", assigned_team = ?"
            params.append(assigned_team)
        
        update_sql += " WHERE id = ?"
        params.append(complaint_id)
        
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(update_sql, params)
                conn.commit()
                
                if cursor.rowcount > 0:
                    logger.info(f"Updated complaint {complaint_id} status to {status}")
                    return True
                else:
                    logger.warning(f"No complaint found with ID {complaint_id}")
                    return False
        except Exception as e:
            logger.error(f"Error updating complaint status: {e}")
            raise
    
    def get_recent_complaints(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent complaints ordered by creation date.
        
        Args:
            limit: Maximum number of complaints to return
            
        Returns:
            List of complaint dictionaries
        """
        select_sql = """
        SELECT * FROM complaints 
        ORDER BY created_at DESC 
        LIMIT ?
        """
        
        with self.get_connection() as conn:
            cursor = conn.execute(select_sql, (limit,))
            rows = cursor.fetchall()
            
            return [dict(row) for row in rows]
    
    def get_complaints_by_status(self, status: str) -> List[Dict[str, Any]]:
        """
        Get complaints filtered by status.
        
        Args:
            status: Status to filter by
            
        Returns:
            List of complaint dictionaries
        """
        select_sql = "SELECT * FROM complaints WHERE status = ? ORDER BY created_at DESC"
        
        with self.get_connection() as conn:
            cursor = conn.execute(select_sql, (status,))
            rows = cursor.fetchall()
            
            return [dict(row) for row in rows]
    
    def get_analytics(self) -> Dict[str, Any]:
        """
        Get analytics data for dashboard.
        
        Returns:
            Dictionary containing analytics data
        """
        analytics = {}
        
        with self.get_connection() as conn:
            # Total complaints
            cursor = conn.execute("SELECT COUNT(*) as total FROM complaints")
            analytics['total_complaints'] = cursor.fetchone()['total']
            
            # Complaints by category
            cursor = conn.execute("""
                SELECT category, COUNT(*) as count 
                FROM complaints 
                GROUP BY category 
                ORDER BY count DESC
            """)
            analytics['by_category'] = dict(cursor.fetchall())
            
            # Complaints by priority
            cursor = conn.execute("""
                SELECT priority, COUNT(*) as count 
                FROM complaints 
                GROUP BY priority 
                ORDER BY count DESC
            """)
            analytics['by_priority'] = dict(cursor.fetchall())
            
            # Complaints by status
            cursor = conn.execute("""
                SELECT status, COUNT(*) as count 
                FROM complaints 
                GROUP BY status 
                ORDER BY count DESC
            """)
            analytics['by_status'] = dict(cursor.fetchall())
            
            # Complaints by team
            cursor = conn.execute("""
                SELECT assigned_team, COUNT(*) as count 
                FROM complaints 
                GROUP BY assigned_team 
                ORDER BY count DESC
            """)
            analytics['by_team'] = dict(cursor.fetchall())
            
            # Average response time (simplified - using created_at as proxy)
            cursor = conn.execute("""
                SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days
                FROM complaints 
                WHERE status != 'New'
            """)
            result = cursor.fetchone()
            analytics['avg_response_days'] = result['avg_days'] or 0
            
            # Recent complaints (last 24 hours)
            cursor = conn.execute("""
                SELECT COUNT(*) as recent_count
                FROM complaints 
                WHERE created_at >= datetime('now', '-1 day')
            """)
            analytics['recent_complaints'] = cursor.fetchone()['recent_count']
        
        return analytics
    
    def search_complaints(self, query: str) -> List[Dict[str, Any]]:
        """
        Search complaints by text content.
        
        Args:
            query: Search query
            
        Returns:
            List of matching complaint dictionaries
        """
        search_sql = """
        SELECT * FROM complaints 
        WHERE subject LIKE ? OR body LIKE ? OR customer_name LIKE ?
        ORDER BY created_at DESC
        """
        
        search_term = f"%{query}%"
        
        with self.get_connection() as conn:
            cursor = conn.execute(search_sql, (search_term, search_term, search_term))
            rows = cursor.fetchall()
            
            return [dict(row) for row in rows]
    
    def get_complaints_by_date_range(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """
        Get complaints within a date range.
        
        Args:
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            
        Returns:
            List of complaint dictionaries
        """
        select_sql = """
        SELECT * FROM complaints 
        WHERE date(created_at) BETWEEN ? AND ?
        ORDER BY created_at DESC
        """
        
        with self.get_connection() as conn:
            cursor = conn.execute(select_sql, (start_date, end_date))
            rows = cursor.fetchall()
            
            return [dict(row) for row in rows]
    
    def get_complaints_filtered(self, status: str = None, priority: str = None, 
                               category: str = None, search: str = None, 
                               page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """
        Get complaints with filtering and pagination.
        
        Args:
            status: Filter by status
            priority: Filter by priority
            category: Filter by category
            search: Search in subject and body
            page: Page number (1-based)
            limit: Number of results per page
            
        Returns:
            Dictionary with complaints, total count, and pagination info
        """
        # Build WHERE clause
        conditions = []
        params = []
        
        if status:
            conditions.append("status = ?")
            params.append(status)
        
        if priority:
            conditions.append("priority = ?")
            params.append(priority)
        
        if category:
            conditions.append("category = ?")
            params.append(category)
        
        if search:
            conditions.append("(subject LIKE ? OR body LIKE ?)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        where_clause = ""
        if conditions:
            where_clause = "WHERE " + " AND ".join(conditions)
        
        # Count total
        count_sql = f"SELECT COUNT(*) as total FROM complaints {where_clause}"
        
        with self.get_connection() as conn:
            cursor = conn.execute(count_sql, params)
            total = cursor.fetchone()['total']
            
            # Get paginated results
            offset = (page - 1) * limit
            select_sql = f"""
            SELECT * FROM complaints 
            {where_clause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
            """
            
            cursor = conn.execute(select_sql, params + [limit, offset])
            rows = cursor.fetchall()
            
            complaints = [dict(row) for row in rows]
            
            return {
                'complaints': complaints,
                'total': total,
                'page': page,
                'total_pages': (total + limit - 1) // limit,
                'limit': limit
            }
    
    def get_complaint_by_id(self, complaint_id: int) -> Optional[Dict[str, Any]]:
        """
        Get complaint by ID (alias for get_complaint for API consistency).
        
        Args:
            complaint_id: ID of the complaint
            
        Returns:
            Complaint dictionary or None
        """
        return self.get_complaint(complaint_id)
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """
        Get dashboard statistics.
        
        Returns:
            Dictionary with dashboard stats
        """
        today = datetime.now().date()
        
        with self.get_connection() as conn:
            # Total complaints today
            cursor = conn.execute("""
                SELECT COUNT(*) as today_count
                FROM complaints 
                WHERE date(created_at) = ?
            """, (today.strftime('%Y-%m-%d'),))
            today_count = cursor.fetchone()['today_count']
            
            # Pending complaints
            cursor = conn.execute("""
                SELECT COUNT(*) as pending_count
                FROM complaints 
                WHERE status = 'New'
            """)
            pending_count = cursor.fetchone()['pending_count']
            
            # Average response time
            cursor = conn.execute("""
                SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days
                FROM complaints 
                WHERE status = 'Resolved'
            """)
            avg_days = cursor.fetchone()['avg_days'] or 0
            
            return {
                'total_complaints_today': today_count,
                'pending_complaints': pending_count,
                'average_response_time_hours': avg_days * 24,
                'total_complaints': self.get_analytics()['total_complaints']
            }
    
    def get_priority_distribution(self) -> List[Dict[str, Any]]:
        """
        Get priority distribution for charts.
        
        Returns:
            List of priority data for charts
        """
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT priority, COUNT(*) as count
                FROM complaints 
                GROUP BY priority 
                ORDER BY count DESC
            """)
            rows = cursor.fetchall()
            
            priority_data = []
            colors = {
                'Urgent': '#dc3545',
                'High': '#fd7e14',
                'Medium': '#ffc107',
                'Low': '#28a745'
            }
            
            for row in rows:
                priority_data.append({
                    'label': row['priority'],
                    'value': row['count'],
                    'color': colors.get(row['priority'], '#6c757d')
                })
            
            return priority_data
    
    def get_category_breakdown(self) -> List[Dict[str, Any]]:
        """
        Get category breakdown for charts.
        
        Returns:
            List of category data for charts
        """
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT category, COUNT(*) as count
                FROM complaints 
                GROUP BY category 
                ORDER BY count DESC
            """)
            rows = cursor.fetchall()
            
            return [{'category': row['category'], 'count': row['count']} for row in rows]
    
    def get_complaints_over_time(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        Get complaints over time for trend charts.
        
        Args:
            days: Number of days to look back
            
        Returns:
            List of time series data
        """
        with self.get_connection() as conn:
            cursor = conn.execute(f"""
                SELECT date(created_at) as date, COUNT(*) as count
                FROM complaints 
                WHERE created_at >= date('now', '-{days} days')
                GROUP BY date(created_at)
                ORDER BY date(created_at)
            """)
            rows = cursor.fetchall()
            
            return [{'date': row['date'], 'count': row['count']} for row in rows]
    
    def get_recent_activity(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get recent activity events.
        
        Args:
            limit: Maximum number of events
            
        Returns:
            List of activity events
        """
        recent_complaints = self.get_recent_complaints(limit)
        
        activity_events = []
        for complaint in recent_complaints:
            activity_events.append({
                'type': 'complaint_received',
                'description': f"New {complaint['priority']} priority {complaint['category']} complaint",
                'timestamp': complaint['created_at'],
                'complaint_id': complaint['id'],
                'customer_name': complaint['customer_name']
            })
        
        return activity_events
    
    def update_complaint_status(self, complaint_id: int, status: str) -> bool:
        """
        Update complaint status (alias for update_status for API consistency).
        
        Args:
            complaint_id: ID of the complaint
            status: New status
            
        Returns:
            True if successful
        """
        return self.update_status(complaint_id, status)
    
    def get_teams_with_stats(self) -> List[Dict[str, Any]]:
        """
        Get teams with their statistics.
        
        Returns:
            List of team data with stats
        """
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT assigned_team, COUNT(*) as active_complaints
                FROM complaints 
                WHERE status != 'Resolved'
                GROUP BY assigned_team
            """)
            rows = cursor.fetchall()
            
            team_stats = {row['assigned_team']: row['active_complaints'] for row in rows}
            
            # Define teams
            teams = [
                {
                    'id': 1,
                    'name': 'Billing Team',
                    'active_complaints': team_stats.get('Billing Team', 0),
                    'categories': ['Billing Issue']
                },
                {
                    'id': 2,
                    'name': 'Technical Team',
                    'active_complaints': team_stats.get('Technical Team', 0),
                    'categories': ['Technical Support', 'Product Defect']
                },
                {
                    'id': 3,
                    'name': 'Refunds Team',
                    'active_complaints': team_stats.get('Refunds Team', 0),
                    'categories': ['Refund Request']
                },
                {
                    'id': 4,
                    'name': 'Delivery Team',
                    'active_complaints': team_stats.get('Delivery Team', 0),
                    'categories': ['Delivery Problem']
                },
                {
                    'id': 5,
                    'name': 'Account Team',
                    'active_complaints': team_stats.get('Account Team', 0),
                    'categories': ['Account Issue']
                },
                {
                    'id': 6,
                    'name': 'General Support Team',
                    'active_complaints': team_stats.get('General Support Team', 0),
                    'categories': ['General Inquiry']
                }
            ]
            
            return teams