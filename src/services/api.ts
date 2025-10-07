const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface DashboardStats {
  total_complaints: number;
  pending_complaints: number;
  total_complaints_today: number;
}

interface Complaint {
  id: number;
  customerName: string;
  email: string;
  subject: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  timestamp: string;
  sentiment: string;
}

interface CreateComplaintRequest {
  customerName: string;
  email: string;
  subject: string;
  description: string;
  priority?: string;
  category?: string;
  sentiment?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }

    return result.data;
  }

  // Dashboard API calls
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getHealthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // Complaints API calls
  async getComplaints(): Promise<Complaint[]> {
    return this.request<Complaint[]>('/complaints');
  }

  async getComplaint(id: string): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${id}`);
  }

  async createComplaint(complaint: CreateComplaintRequest): Promise<Complaint> {
    return this.request<Complaint>('/complaints', {
      method: 'POST',
      body: JSON.stringify(complaint),
    });
  }

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Teams API calls
  async getTeams(): Promise<any[]> {
    return this.request<any[]>('/teams');
  }

  // Analytics API calls
  async getAnalytics(): Promise<any> {
    return this.request<any>('/analytics');
  }
}

export const apiService = new ApiService();
export default apiService;
