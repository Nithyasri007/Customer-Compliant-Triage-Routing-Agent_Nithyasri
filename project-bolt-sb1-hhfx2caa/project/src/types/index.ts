export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Status = 'new' | 'in_progress' | 'resolved' | 'escalated';
export type Category = 'billing' | 'technical' | 'delivery' | 'refund' | 'customer_care' | 'product' | 'account';
export type Channel = 'email' | 'chat' | 'phone' | 'web';
export type Sentiment = 'angry' | 'frustrated' | 'neutral' | 'satisfied';

export interface Complaint {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  category: Category;
  priority: Priority;
  sentiment: Sentiment;
  status: Status;
  channel: Channel;
  teamId: string;
  assignedTo?: string;
  timestamp: Date;
  updatedAt: Date;
  slaDeadline: Date;
  aiConfidence: number;
  attachments?: string[];
  entities?: Record<string, string>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: Date;
  totalComplaints: number;
  avatar: string;
}

export interface Team {
  id: string;
  name: string;
  icon: string;
  color: string;
  email: string;
  members: TeamMember[];
  categories: Category[];
  activeComplaints: number;
  avgResponseTime: number;
  resolutionRate: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  userId?: string;
  complaintId?: string;
  icon: string;
  color: string;
}

export interface DashboardStats {
  totalToday: number;
  totalTrend: number;
  pending: number;
  avgResponseTime: number;
  slaCompliance: number;
}
