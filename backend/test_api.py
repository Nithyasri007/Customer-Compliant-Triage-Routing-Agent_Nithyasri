#!/usr/bin/env python3
"""
Test script for the Customer Complaint Triage Agent API endpoints.

This script tests all API endpoints to ensure they work correctly
before frontend integration.
"""

import requests
import json
import sys
import time
from datetime import datetime

BASE_URL = "http://localhost:5000/api"

def test_health_check():
    """Test the health check endpoint."""
    print("🔍 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            print("✅ Health check passed")
            print(f"   Status: {data['data']['status']}")
            print(f"   Database: {data['data']['database']}")
            print(f"   Total Complaints: {data['data']['total_complaints']}")
            return True
        else:
            print(f"❌ Health check failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_dashboard_endpoints():
    """Test dashboard endpoints."""
    print("\n📊 Testing Dashboard Endpoints...")
    
    # Test dashboard stats
    try:
        response = requests.get(f"{BASE_URL}/dashboard/stats")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            stats = data['data']
            print("✅ Dashboard stats retrieved")
            print(f"   Today's complaints: {stats['total_complaints_today']}")
            print(f"   Pending complaints: {stats['pending_complaints']}")
            print(f"   Total complaints: {stats['total_complaints']}")
        else:
            print(f"❌ Dashboard stats failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Dashboard stats error: {e}")
        return False
    
    # Test dashboard charts
    try:
        response = requests.get(f"{BASE_URL}/dashboard/charts")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            charts = data['data']
            print("✅ Dashboard charts retrieved")
            print(f"   Priority data points: {len(charts['priority_distribution'])}")
            print(f"   Category data points: {len(charts['category_breakdown'])}")
            print(f"   Time series points: {len(charts['complaints_over_time'])}")
        else:
            print(f"❌ Dashboard charts failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Dashboard charts error: {e}")
        return False
    
    # Test recent complaints
    try:
        response = requests.get(f"{BASE_URL}/dashboard/recent")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            recent = data['data']
            print("✅ Recent complaints retrieved")
            print(f"   Recent complaints count: {len(recent)}")
        else:
            print(f"❌ Recent complaints failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Recent complaints error: {e}")
        return False
    
    # Test activity feed
    try:
        response = requests.get(f"{BASE_URL}/dashboard/activity")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            activity = data['data']
            print("✅ Activity feed retrieved")
            print(f"   Activity events: {len(activity)}")
        else:
            print(f"❌ Activity feed failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Activity feed error: {e}")
        return False
    
    return True

def test_complaints_crud():
    """Test complaints CRUD operations."""
    print("\n📝 Testing Complaints CRUD...")
    
    # Test get complaints
    try:
        response = requests.get(f"{BASE_URL}/complaints")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            complaints_data = data['data']
            print("✅ Get complaints successful")
            print(f"   Total complaints: {complaints_data['total']}")
            print(f"   Current page: {complaints_data['page']}")
            print(f"   Total pages: {complaints_data['total_pages']}")
        else:
            print(f"❌ Get complaints failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Get complaints error: {e}")
        return False
    
    # Test create complaint
    complaint_data = {
        "customer_name": "Test User",
        "customer_email": "test@example.com",
        "subject": "Test Complaint via API",
        "body": "This is a test complaint created via API integration testing. The complaint should be automatically classified and routed to the appropriate team.",
        "channel": "Web Form"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/complaints", json=complaint_data)
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            created_complaint = data['data']
            complaint_id = created_complaint['id']
            print("✅ Create complaint successful")
            print(f"   Created complaint ID: {complaint_id}")
            print(f"   Category: {created_complaint['category']}")
            print(f"   Priority: {created_complaint['priority']}")
            print(f"   Assigned Team: {created_complaint['assigned_team']}")
            
            # Test get complaint by ID
            try:
                response = requests.get(f"{BASE_URL}/complaints/{complaint_id}")
                data = response.json()
                
                if response.status_code == 200 and data['success']:
                    complaint = data['data']
                    print("✅ Get complaint by ID successful")
                    print(f"   Retrieved complaint: {complaint['subject']}")
                else:
                    print(f"❌ Get complaint by ID failed: {data}")
                    return False
            except Exception as e:
                print(f"❌ Get complaint by ID error: {e}")
                return False
            
            # Test update complaint
            try:
                update_data = {
                    "status": "In Progress",
                    "priority": "High"
                }
                response = requests.put(f"{BASE_URL}/complaints/{complaint_id}", json=update_data)
                data = response.json()
                
                if response.status_code == 200 and data['success']:
                    updated_complaint = data['data']
                    print("✅ Update complaint successful")
                    print(f"   Updated status: {updated_complaint['status']}")
                else:
                    print(f"❌ Update complaint failed: {data}")
                    return False
            except Exception as e:
                print(f"❌ Update complaint error: {e}")
                return False
            
            # Test reclassify complaint
            try:
                response = requests.post(f"{BASE_URL}/complaints/{complaint_id}/reclassify")
                data = response.json()
                
                if response.status_code == 200 and data['success']:
                    reclassified = data['data']
                    print("✅ Reclassify complaint successful")
                    print(f"   Reclassified category: {reclassified['category']}")
                    print(f"   Reclassified priority: {reclassified['priority']}")
                else:
                    print(f"❌ Reclassify complaint failed: {data}")
                    return False
            except Exception as e:
                print(f"❌ Reclassify complaint error: {e}")
                return False
            
            # Test escalate complaint
            try:
                response = requests.post(f"{BASE_URL}/complaints/{complaint_id}/escalate")
                data = response.json()
                
                if response.status_code == 200 and data['success']:
                    escalated = data['data']
                    print("✅ Escalate complaint successful")
                    print(f"   Escalation sent: {escalated.get('escalation_sent', False)}")
                else:
                    print(f"❌ Escalate complaint failed: {data}")
                    return False
            except Exception as e:
                print(f"❌ Escalate complaint error: {e}")
                return False
            
            # Test resolve complaint
            try:
                response = requests.post(f"{BASE_URL}/complaints/{complaint_id}/resolve")
                data = response.json()
                
                if response.status_code == 200 and data['success']:
                    resolved = data['data']
                    print("✅ Resolve complaint successful")
                    print(f"   Resolved status: {resolved['status']}")
                else:
                    print(f"❌ Resolve complaint failed: {data}")
                    return False
            except Exception as e:
                print(f"❌ Resolve complaint error: {e}")
                return False
            
        else:
            print(f"❌ Create complaint failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Create complaint error: {e}")
        return False
    
    return True

def test_teams_endpoints():
    """Test teams endpoints."""
    print("\n👥 Testing Teams Endpoints...")
    
    try:
        response = requests.get(f"{BASE_URL}/teams")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            teams = data['data']
            print("✅ Get teams successful")
            print(f"   Number of teams: {len(teams)}")
            
            for team in teams:
                print(f"   - {team['name']}: {team['active_complaints']} active complaints")
        else:
            print(f"❌ Get teams failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Get teams error: {e}")
        return False
    
    return True

def test_analytics_endpoints():
    """Test analytics endpoints."""
    print("\n📈 Testing Analytics Endpoints...")
    
    # Test analytics overview
    try:
        response = requests.get(f"{BASE_URL}/analytics/overview?time_range=30days")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            overview = data['data']
            print("✅ Analytics overview retrieved")
            print(f"   Time range: {overview['time_range']}")
            print(f"   Total complaints: {overview['total_complaints']}")
            print(f"   Categories: {len(overview['category_breakdown'])}")
            print(f"   Priorities: {len(overview['priority_breakdown'])}")
        else:
            print(f"❌ Analytics overview failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Analytics overview error: {e}")
        return False
    
    # Test trends
    try:
        response = requests.get(f"{BASE_URL}/analytics/trends")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            trends = data['data']
            print("✅ Trends data retrieved")
            print(f"   Trend data points: {len(trends)}")
        else:
            print(f"❌ Trends data failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Trends data error: {e}")
        return False
    
    return True

def test_filtering_and_pagination():
    """Test filtering and pagination."""
    print("\n🔍 Testing Filtering and Pagination...")
    
    # Test filtering by status
    try:
        response = requests.get(f"{BASE_URL}/complaints?status=New&limit=5")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            complaints_data = data['data']
            print("✅ Filter by status successful")
            print(f"   Filtered complaints: {len(complaints_data['complaints'])}")
            print(f"   Total matching: {complaints_data['total']}")
        else:
            print(f"❌ Filter by status failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Filter by status error: {e}")
        return False
    
    # Test pagination
    try:
        response = requests.get(f"{BASE_URL}/complaints?page=1&limit=2")
        data = response.json()
        
        if response.status_code == 200 and data['success']:
            complaints_data = data['data']
            print("✅ Pagination successful")
            print(f"   Page: {complaints_data['page']}")
            print(f"   Limit: {complaints_data['limit']}")
            print(f"   Total pages: {complaints_data['total_pages']}")
            print(f"   Results on page: {len(complaints_data['complaints'])}")
        else:
            print(f"❌ Pagination failed: {data}")
            return False
    except Exception as e:
        print(f"❌ Pagination error: {e}")
        return False
    
    return True

def main():
    """Run all API tests."""
    print("🚀 Starting Customer Complaint Triage Agent API Tests")
    print("=" * 60)
    
    # Check if server is running
    print("⏳ Checking if API server is running...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ API server is not responding correctly")
            print("💡 Make sure to start the server with: python main.py --mode api")
            sys.exit(1)
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to API server")
        print("💡 Make sure to start the server with: python main.py --mode api")
        sys.exit(1)
    
    print("✅ API server is running")
    
    # Run tests
    tests = [
        ("Health Check", test_health_check),
        ("Dashboard Endpoints", test_dashboard_endpoints),
        ("Complaints CRUD", test_complaints_crud),
        ("Teams Endpoints", test_teams_endpoints),
        ("Analytics Endpoints", test_analytics_endpoints),
        ("Filtering and Pagination", test_filtering_and_pagination),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} error: {e}")
    
    print("\n" + "=" * 60)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! API is ready for frontend integration.")
        print("\n💡 Next steps:")
        print("   1. Update your frontend to use the API endpoints")
        print("   2. Set VITE_API_BASE_URL=http://localhost:5000/api in your frontend .env")
        print("   3. Test the integration with your React components")
    else:
        print("⚠️  Some tests failed. Please check the API server and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()
