import apiClient from './client';
import { ApiResponse } from './types';

// Dealer types
export interface Dealer {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'dealer';
  kycStatus: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DealerDetails extends Dealer {
  tradeStats: {
    totalTrades: number;
    totalVolume: number;
    settledTrades: number;
    settledVolume: number;
    pendingTrades: number;
  };
  trades: {
    id: string;
    clientName: string;
    clientEmail: string;
    cryptoAsset: string;
    cryptoAmount: number;
    nairaAmount: number;
    rate: number;
    status: string;
    createdAt: string;
  }[];
  auditLogs: {
    id: string;
    action: string;
    details: string;
    severity: 'info' | 'warning' | 'critical';
    actor: string;
    ipAddress?: string;
    createdAt: string;
  }[];
}

export interface CreateDealerInput {
  email: string;
  fullName: string;
  phoneNumber?: string;
}

export interface UpdateDealerInput {
  fullName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface ListUsersQuery {
  role?: 'client' | 'dealer' | 'admin' | 'all';
  status?: 'active' | 'inactive' | 'all';
  kycStatus?: 'Pending' | 'Verified' | 'Rejected' | 'Suspended' | 'all';
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'dealer' | 'admin';
  kycStatus: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create a new dealer account
export const createDealer = async (data: CreateDealerInput): Promise<Dealer> => {
  const response = await apiClient.post<ApiResponse<Dealer>>('/admin/dealers', data);
  return response.data.data;
};

// Get all dealers
export const getDealers = async (): Promise<Dealer[]> => {
  const response = await apiClient.get<ApiResponse<Dealer[]>>('/admin/dealers');
  return response.data.data;
};

// Get a single dealer with details
export const getDealer = async (id: string): Promise<DealerDetails> => {
  const response = await apiClient.get<ApiResponse<DealerDetails>>(`/admin/dealers/${id}`);
  return response.data.data;
};

// Update a dealer
export const updateDealer = async (id: string, data: UpdateDealerInput): Promise<Dealer> => {
  const response = await apiClient.put<ApiResponse<Dealer>>(`/admin/dealers/${id}`, data);
  return response.data.data;
};

// Suspend a dealer
export const suspendDealer = async (id: string, reason: string): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(`/admin/dealers/${id}/suspend`, { reason });
  return response.data.data;
};

// Reactivate a dealer
export const reactivateDealer = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(`/admin/dealers/${id}/reactivate`);
  return response.data.data;
};

// Reset dealer password
export const resetDealerPassword = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(`/admin/dealers/${id}/reset-password`);
  return response.data.data;
};

// List all users with filters
export const listUsers = async (query: ListUsersQuery): Promise<PaginatedResponse<UserListItem>> => {
  const params = new URLSearchParams();
  if (query.role) params.append('role', query.role);
  if (query.status) params.append('status', query.status);
  if (query.kycStatus) params.append('kycStatus', query.kycStatus);
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  
  const response = await apiClient.get<ApiResponse<PaginatedResponse<UserListItem>>>(`/admin/users?${params.toString()}`);
  return response.data.data;
};

// Admin Dashboard types
export interface AdminDashboard {
  users: {
    total: number;
    verified: number;
    pendingKyc: number;
    active: number;
    activeToday: number;
  };
  dealers: {
    total: number;
    active: number;
    verified: number;
  };
  trades: {
    total: number;
    totalVolume: number;
    settled: number;
    settledVolume: number;
    pending: number;
    pendingVolume: number;
  };
  quotes: {
    total: number;
    pending: number;
  };
  exchangeRates: {
    USDT_NGN: number;
    USDC_NGN: number;
    BTC_USD: number;
    USD_NGN: number;
    BTC_NGN: number;
    lastUpdated: string;
  };
  recentActivity: {
    id: string;
    action: string;
    details: string;
    severity: 'info' | 'warning' | 'critical';
    actor: string;
    createdAt: string;
  }[];
}

export interface UserDetails {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'client' | 'dealer' | 'admin';
  kycStatus: string;
  isActive: boolean;
  emailVerified: boolean;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    isVerified: boolean;
  } | null;
  wallets: {
    network: string;
    address: string;
  }[];
  hasWallets: boolean;
  tradeStats: {
    totalTrades: number;
    totalVolume: number;
    settledTrades: number;
  };
  transactions: {
    id: string;
    cryptoAsset: string;
    cryptoAmount: number;
    nairaAmount: number;
    rate: number;
    status: string;
    createdAt: string;
  }[];
  auditLogs: {
    id: string;
    action: string;
    details: string;
    severity: 'info' | 'warning' | 'critical';
    actor: string;
    ipAddress?: string;
    createdAt: string;
  }[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Get admin dashboard data
export const getAdminDashboard = async (): Promise<AdminDashboard> => {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
  return response.data.data;
};

// Get user details
export const getUserDetails = async (id: string): Promise<UserDetails> => {
  const response = await apiClient.get<ApiResponse<UserDetails>>(`/admin/users/${id}`);
  return response.data.data;
};

// Suspend a user
export const suspendUser = async (id: string, reason: string): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(`/admin/users/${id}/suspend`, { reason });
  return response.data.data;
};

// Reactivate a user
export const reactivateUser = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(`/admin/users/${id}/reactivate`);
  return response.data.data;
};

// Create wallets for a user
export const createUserWallets = async (id: string): Promise<{ message: string; wallets: { network: string; address: string }[]; created: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ message: string; wallets: { network: string; address: string }[]; created: boolean }>>(`/admin/users/${id}/wallets`);
  return response.data.data;
};


// Audit Log types
export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorRole?: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuditLogsQuery {
  action?: string;
  severity?: 'info' | 'warning' | 'critical';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get audit logs
export const getAuditLogs = async (query: AuditLogsQuery): Promise<AuditLogsResponse> => {
  const params = new URLSearchParams();
  if (query.action) params.append('action', query.action);
  if (query.severity) params.append('severity', query.severity);
  if (query.search) params.append('search', query.search);
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  
  const response = await apiClient.get<ApiResponse<AuditLogsResponse>>(`/admin/audit?${params.toString()}`);
  return response.data.data;
};
