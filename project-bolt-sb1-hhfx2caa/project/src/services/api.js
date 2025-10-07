/**
 * API Service for Customer Complaint Triage Agent Frontend
 * 
 * This module provides a centralized API client for communicating with the backend.
 * All API calls are standardized and include proper error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data;
};

// Helper function to create request options
const createRequestOptions = (method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

export const api = {
  // ============= DASHBOARD ENDPOINTS =============
  
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return handleResponse(response);
  },
  
  /**
   * Get dashboard chart data
   * @returns {Promise<Object>} Chart data for priority, category, and trends
   */
  getDashboardCharts: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/charts`);
    return handleResponse(response);
  },
  
  /**
   * Get recent complaints for dashboard
   * @returns {Promise<Array>} Recent complaints list
   */
  getRecentComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent`);
    return handleResponse(response);
  },
  
  /**
   * Get activity feed for dashboard
   * @returns {Promise<Array>} Recent activity events
   */
  getActivityFeed: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/activity`);
    return handleResponse(response);
  },
  
  // ============= COMPLAINTS CRUD ENDPOINTS =============
  
  /**
   * Get complaints with filtering and pagination
   * @param {Object} filters - Filter options
   * @param {string} filters.status - Filter by status
   * @param {string} filters.priority - Filter by priority
   * @param {string} filters.category - Filter by category
   * @param {string} filters.search - Search term
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Results per page
   * @returns {Promise<Object>} Paginated complaints data
   */
  getComplaints: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/complaints?${params}`);
    return handleResponse(response);
  },
  
  /**
   * Get single complaint by ID
   * @param {number} id - Complaint ID
   * @returns {Promise<Object>} Complaint details
   */
  getComplaintById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`);
    return handleResponse(response);
  },
  
  /**
   * Create new complaint from web form
   * @param {Object} complaintData - Complaint data
   * @param {string} complaintData.customer_name - Customer name
   * @param {string} complaintData.customer_email - Customer email
   * @param {string} complaintData.subject - Complaint subject
   * @param {string} complaintData.body - Complaint body
   * @param {string} complaintData.channel - Submission channel
   * @returns {Promise<Object>} Created complaint
   */
  createComplaint: async (complaintData) => {
    const response = await fetch(`${API_BASE_URL}/complaints`, 
      createRequestOptions('POST', complaintData)
    );
    return handleResponse(response);
  },
  
  /**
   * Update complaint
   * @param {number} id - Complaint ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated complaint
   */
  updateComplaint: async (id, updates) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, 
      createRequestOptions('PUT', updates)
    );
    return handleResponse(response);
  },
  
  /**
   * Resolve complaint
   * @param {number} id - Complaint ID
   * @returns {Promise<Object>} Resolved complaint
   */
  resolveComplaint: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}/resolve`, 
      createRequestOptions('POST')
    );
    return handleResponse(response);
  },
  
  /**
   * Escalate complaint to manager
   * @param {number} id - Complaint ID
   * @returns {Promise<Object>} Escalated complaint
   */
  escalateComplaint: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}/escalate`, 
      createRequestOptions('POST')
    );
    return handleResponse(response);
  },
  
  /**
   * Reclassify complaint using AI
   * @param {number} id - Complaint ID
   * @returns {Promise<Object>} Reclassified complaint
   */
  reclassifyComplaint: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}/reclassify`, 
      createRequestOptions('POST')
    );
    return handleResponse(response);
  },
  
  // ============= TEAMS ENDPOINTS =============
  
  /**
   * Get all teams with statistics
   * @returns {Promise<Array>} Teams list with stats
   */
  getTeams: async () => {
    const response = await fetch(`${API_BASE_URL}/teams`);
    return handleResponse(response);
  },
  
  /**
   * Assign complaint to team
   * @param {number} teamId - Team ID
   * @param {number} complaintId - Complaint ID
   * @returns {Promise<Object>} Updated complaint
   */
  assignToTeam: async (teamId, complaintId) => {
    const response = await fetch(`${API_BASE_URL}/teams/${teamId}/assign`, 
      createRequestOptions('POST', { complaint_id: complaintId })
    );
    return handleResponse(response);
  },
  
  // ============= ANALYTICS ENDPOINTS =============
  
  /**
   * Get analytics overview
   * @param {string} timeRange - Time range (today, 7days, 30days, 90days)
   * @returns {Promise<Object>} Analytics overview data
   */
  getAnalyticsOverview: async (timeRange = '30days') => {
    const response = await fetch(`${API_BASE_URL}/analytics/overview?time_range=${timeRange}`);
    return handleResponse(response);
  },
  
  /**
   * Get trends data for charts
   * @returns {Promise<Array>} Time series trends data
   */
  getTrends: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics/trends`);
    return handleResponse(response);
  },
  
  // ============= UTILITY ENDPOINTS =============
  
  /**
   * Health check endpoint
   * @returns {Promise<Object>} Health status
   */
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  }
};

// ============= CUSTOM HOOKS FOR REACT COMPONENTS =============

import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching complaints with loading and error states
 * @param {Object} filters - Filter parameters
 * @returns {Object} { complaints, loading, error, refetch }
 */
export const useComplaints = (filters = {}) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getComplaints(filters);
      setComplaints(data.complaints || []);
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.total_pages,
        limit: data.limit
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchComplaints();
  }, [JSON.stringify(filters)]);
  
  return { 
    complaints, 
    loading, 
    error, 
    pagination,
    refetch: fetchComplaints 
  };
};

/**
 * Custom hook for dashboard data
 * @returns {Object} { stats, charts, recent, activity, loading, error }
 */
export const useDashboardData = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, chartsData, recentData, activityData] = await Promise.all([
        api.getDashboardStats(),
        api.getDashboardCharts(),
        api.getRecentComplaints(),
        api.getActivityFeed()
      ]);
      
      setStats(statsData);
      setCharts(chartsData);
      setRecent(recentData);
      setActivity(activityData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  return { 
    stats, 
    charts, 
    recent, 
    activity, 
    loading, 
    error,
    refetch: fetchDashboardData 
  };
};

/**
 * Custom hook for analytics data
 * @param {string} timeRange - Time range for analytics
 * @returns {Object} { overview, trends, loading, error }
 */
export const useAnalytics = (timeRange = '30days') => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overviewData, trendsData] = await Promise.all([
        api.getAnalyticsOverview(timeRange),
        api.getTrends()
      ]);
      
      setOverview(overviewData);
      setTrends(trendsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);
  
  return { 
    overview, 
    trends, 
    loading, 
    error,
    refetch: fetchAnalytics 
  };
};

/**
 * Custom hook for teams data
 * @returns {Object} { teams, loading, error }
 */
export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTeams();
      setTeams(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTeams();
  }, []);
  
  return { 
    teams, 
    loading, 
    error,
    refetch: fetchTeams 
  };
};

export default api;
