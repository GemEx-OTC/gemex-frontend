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
  phoneVerified: boolean;
  phoneNumber?: string;
  ninVerified: boolean;
  cacVerified: boolean;
  tier: number;
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

// Dealer Dashboard Types
export interface DealerUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface DealerMetrics {
  totalLocked: number;
  awaitingPayouts: number;
  payoutBalance: number;
  pendingPayoutCount: number;
  totalTrades: number;
  settledTrades: number;
  totalVolume: number;
  pendingTrades: number;
}

export interface DealerQuote {
  id: string;
  quoteId: string;
  customer: string;
  customerEmail: string;
  cryptoAsset: string;
  cryptoAmount: number;
  estimatedNaira: number;
  status: string;
  createdAt: string;
}

export interface DealerTrade {
  id: string;
  customer: string;
  customerEmail: string;
  type: string;
  cryptoAsset: string;
  cryptoNetwork: string;
  cryptoAmount: number;
  nairaAmount: number;
  rate: number;
  status: string;
  createdAt: string;
}

export interface DealerDashboardData {
  user: DealerUser;
  metrics: DealerMetrics;
  exchangeRates: ExchangeRates;
  pendingQuotes: number;
  recentQuotes: DealerQuote[];
  recentTrades: DealerTrade[];
  unreadNotifications: number;
}

// Get client dashboard data
export const getClientDashboard = async (): Promise<ClientDashboardData> => {
  const response = await apiClient.get<ApiResponse<ClientDashboardData>>('/dashboard/client');
  return response.data.data;
};

// Get dealer dashboard data
export const getDealerDashboard = async (): Promise<DealerDashboardData> => {
  const response = await apiClient.get<ApiResponse<DealerDashboardData>>('/dashboard/dealer');
  return response.data.data;
};

// Get exchange rates (public endpoint)
export const getExchangeRates = async (): Promise<ExchangeRates> => {
  const response = await apiClient.get<ApiResponse<ExchangeRates>>('/settings/exchange-rates');
  return response.data.data;
};
