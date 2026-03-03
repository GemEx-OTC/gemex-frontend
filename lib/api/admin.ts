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
  autoPayoutEnabled: boolean;
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


// Admin Quotes types
export interface AdminQuote {
  id: string;
  clientName: string;
  clientEmail: string;
  dealerName: string | null;
  dealerEmail: string | null;
  cryptoAsset: string;
  cryptoNetwork: string;
  cryptoAmount: number;
  systemRate: number;
  estimatedNaira: number;
  firmRate?: number;
  firmNairaAmount?: number;
  status: string;
  quotedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminQuotesResponse {
  quotes: AdminQuote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminQuoteDetails extends AdminQuote {
  client: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  dealer: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  trade: {
    id: string;
    transactionId: string;
    status: string;
    depositAddress: string;
    cryptoTxId?: string;
    fiatTxRef?: string;
    createdAt: string;
  } | null;
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

export interface AdminQuotesQuery {
  status?: string;
  page?: number;
  limit?: number;
}

// Get admin quotes
export const getAdminQuotes = async (query: AdminQuotesQuery = {}): Promise<AdminQuotesResponse> => {
  const params = new URLSearchParams();
  if (query.status) params.append('status', query.status);
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  
  const response = await apiClient.get<ApiResponse<AdminQuotesResponse>>(`/admin/quotes?${params.toString()}`);
  return response.data.data;
};

// Get admin quote details
export const getAdminQuoteDetails = async (id: string): Promise<AdminQuoteDetails> => {
  const response = await apiClient.get<ApiResponse<AdminQuoteDetails>>(`/admin/quotes/${id}`);
  return response.data.data;
};

// Admin Trades types
export interface AdminTrade {
  id: string;
  transactionId: string;
  clientName: string;
  clientEmail: string;
  dealerName: string;
  dealerEmail: string;
  cryptoAsset: string;
  cryptoNetwork: string;
  cryptoAmount: number;
  rate: number;
  nairaAmount: number;
  depositAddress: string;
  status: string;
  cryptoTxId?: string;
  fiatTxRef?: string;
  payoutBankCode?: string;
  payoutAccountNumber?: string;
  payoutAccountName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTradesResponse {
  trades: AdminTrade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminTradeDetails extends AdminTrade {
  client: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  dealer: {
    id: string;
    fullName: string;
    email: string;
  };
  depositConfirmedAt?: string;
  confirmations?: number;
  payoutBankCode: string;
  payoutAccountNumber: string;
  payoutAccountName: string;
  payoutInitiatedAt?: string;
  payoutCompletedAt?: string;
  failureReason?: string;
  timestamps: {
    quotePending: string;
    awaitingDeposit?: string;
    cryptoConfirmed?: string;
    payoutPending?: string;
    settled?: string;
    failed?: string;
  };
  quote: {
    id: string;
    systemRate: number;
    firmRate: number;
    status: string;
  } | null;
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

export interface AdminTradesQuery {
  status?: string;
  page?: number;
  limit?: number;
}

// Get admin trades
export const getAdminTrades = async (query: AdminTradesQuery = {}): Promise<AdminTradesResponse> => {
  const params = new URLSearchParams();
  if (query.status) params.append('status', query.status);
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  
  const response = await apiClient.get<ApiResponse<AdminTradesResponse>>(`/admin/trades?${params.toString()}`);
  return response.data.data;
};

// Get admin trade details
export const getAdminTradeDetails = async (id: string): Promise<AdminTradeDetails> => {
  const response = await apiClient.get<ApiResponse<AdminTradeDetails>>(`/admin/trades/${id}`);
  return response.data.data;
};

// Toggle user auto payout (admin)
export const toggleUserAutoPayout = async (id: string, enabled: boolean): Promise<{ message: string; autoPayoutEnabled: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ message: string; autoPayoutEnabled: boolean }>>(`/admin/users/${id}/auto-payout`, { enabled });
  return response.data.data;
};

// Get user auto payout status (admin)
export const getUserAutoPayoutStatus = async (id: string): Promise<{ autoPayoutEnabled: boolean }> => {
  const response = await apiClient.get<ApiResponse<{ autoPayoutEnabled: boolean }>>(`/admin/users/${id}/auto-payout`);
  return response.data.data;
};

// Bank types
export interface Bank {
  code: string;
  name: string;
}

export interface BankAccountValidation {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface ManualPayoutInput {
  tradeId: string;
  amount: number;
  destinationBankCode: string;
  destinationAccountNumber: string;
  destinationAccountName: string;
  narration?: string;
  useUserBankAccount?: boolean;
}

export interface ManualPayoutResponse {
  tradeId: string;
  transactionId: string;
  payoutReference: string;
  amount: number;
  status: string;
  destinationAccountNumber: string;
  destinationAccountName: string;
  fee: number;
  message: string;
}

// Get supported banks
export const getSupportedBanks = async (): Promise<Bank[]> => {
  const response = await apiClient.get<ApiResponse<Bank[]>>('/admin/banks');
  return response.data.data;
};

// Validate bank account
export const validateBankAccount = async (accountNumber: string, bankCode: string): Promise<BankAccountValidation> => {
  const response = await apiClient.post<ApiResponse<BankAccountValidation>>('/admin/validate-bank-account', {
    accountNumber,
    bankCode,
  });
  return response.data.data;
};

// Initiate manual payout
export const initiateManualPayout = async (data: ManualPayoutInput): Promise<ManualPayoutResponse> => {
  const response = await apiClient.post<ApiResponse<ManualPayoutResponse>>(`/admin/trades/${data.tradeId}/manual-payout`, data);
  return response.data.data;
};
