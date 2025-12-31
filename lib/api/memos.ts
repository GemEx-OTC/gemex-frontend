import apiClient from './client';
import { ApiResponse } from './types';

// ============ TYPES ============

export type MemoStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type MemoPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MemoCategory = 'trade_issue' | 'rate_request' | 'client_concern' | 'system_issue' | 'general' | 'escalation';

export interface MemoUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'dealer' | 'admin';
}

export interface MemoReply {
  _id: string;
  message: string;
  createdBy: MemoUser;
  createdAt: string;
}

export interface Memo {
  _id: string;
  memoId: string;
  subject: string;
  message: string;
  category: MemoCategory;
  priority: MemoPriority;
  status: MemoStatus;
  createdBy: MemoUser;
  assignedTo?: MemoUser;
  referenceType?: 'trade' | 'quote' | 'user';
  referenceId?: string;
  replies: MemoReply[];
  isReadByCreator: boolean;
  isReadByAssignee: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemoStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

export interface MemoFilters {
  status?: MemoStatus;
  priority?: MemoPriority;
  category?: MemoCategory;
  createdBy?: string;
  assignedTo?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface MemosResponse {
  memos: Memo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: MemoStats;
}

export interface CreateMemoInput {
  subject: string;
  message: string;
  category?: MemoCategory;
  priority?: MemoPriority;
  assignedTo?: string;
  referenceType?: 'trade' | 'quote' | 'user';
  referenceId?: string;
}

export interface Assignee {
  id: string;
  name: string;
  email: string;
}

// ============ API FUNCTIONS ============

/**
 * Get memos list with filters
 */
export const getMemos = async (filters: MemoFilters = {}): Promise<MemosResponse> => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category) params.append('category', filters.category);
  if (filters.createdBy) params.append('createdBy', filters.createdBy);
  if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
  if (filters.unreadOnly) params.append('unreadOnly', 'true');
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/memos?${queryString}` : '/memos';
  
  const response = await apiClient.get<ApiResponse<MemosResponse>>(url);
  return response.data.data;
};

/**
 * Get memo by ID
 */
export const getMemoById = async (memoId: string): Promise<Memo> => {
  const response = await apiClient.get<ApiResponse<Memo>>(`/memos/${memoId}`);
  return response.data.data;
};

/**
 * Create a new memo
 */
export const createMemo = async (data: CreateMemoInput): Promise<Memo> => {
  const response = await apiClient.post<ApiResponse<Memo>>('/memos', data);
  return response.data.data;
};

/**
 * Add reply to memo
 */
export const addReply = async (memoId: string, message: string): Promise<Memo> => {
  const response = await apiClient.post<ApiResponse<Memo>>(`/memos/${memoId}/reply`, { message });
  return response.data.data;
};

/**
 * Update memo status (admin only)
 */
export const updateMemoStatus = async (memoId: string, status: MemoStatus): Promise<Memo> => {
  const response = await apiClient.put<ApiResponse<Memo>>(`/memos/${memoId}/status`, { status });
  return response.data.data;
};

/**
 * Assign memo to user (admin only)
 */
export const assignMemo = async (memoId: string, assigneeId: string): Promise<Memo> => {
  const response = await apiClient.put<ApiResponse<Memo>>(`/memos/${memoId}/assign`, { assigneeId });
  return response.data.data;
};

/**
 * Get unread memo count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/memos/unread-count');
  return response.data.data.unreadCount;
};

/**
 * Get dealers for assignment (admin only)
 */
export const getDealers = async (): Promise<Assignee[]> => {
  const response = await apiClient.get<ApiResponse<Assignee[]>>('/memos/dealers');
  return response.data.data;
};

/**
 * Get admins for assignment
 */
export const getAdmins = async (): Promise<Assignee[]> => {
  const response = await apiClient.get<ApiResponse<Assignee[]>>('/memos/admins');
  return response.data.data;
};
