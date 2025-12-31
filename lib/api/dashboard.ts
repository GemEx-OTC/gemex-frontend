import apiClient from './client';
import { ApiResponse } from './types';

// Dashboard Types
export interface DashboardUser {
  id: string;
  fullName: string;
  email: string;
  kycStatus: 'Pending' | 'Submitted' | 'Verified' | 'Rejected';
  bankVerified: boolean;
  emailVerified: boolean;
}

export interface DashboardMetrics {
  totalPayouts: number;
  totalDeposits: number;
  pendingPayoutAmount: number;
  pendingTrades: number;
  completedTrades: number;
  totalTrades: number;
}

export interface ExchangeRates {
  USDT_NGN: number;
  USDC_NGN: number;
  BTC_USD: number;
  USD_NGN: number;
  BTC_NGN: number;
  lastUpdated: string;
}

export interface TradeLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perTransactionLimit: number;
}

export interface RecentTransaction {
  id: string;
  type: string;
  cryptoAsset: 'USDT' | 'BTC' | 'USDC';
  cryptoNetwork: string;
  cryptoAmount: number;
  nairaAmount: number;
  rate: number;
  status: string;
  createdAt: string;
  depositConfirmedAt?: string;
  payoutCompletedAt?: string;
}

export interface RecentQuote {
  _id: string;
  cryptoAsset: string;
  cryptoAmount: number;
  estimatedNaira: number;
  status: string;
  createdAt: string;
}

export interface ClientDashboardData {
  user: DashboardUser;
  metrics: DashboardMetrics;
  exchangeRates: ExchangeRates;
  tradeLimits: TradeLimits;
  recentTransactions: RecentTransaction[];
  recentQuotes: RecentQuote[];
  pendingQuotes: number;
  unreadNotifications: number;
}

// Get client dashboard data
export const getClientDashboard = async (): Promise<ClientDashboardData> => {
  const response = await apiClient.get<ApiResponse<ClientDashboardData>>('/dashboard/client');
  return response.data.data;
};
