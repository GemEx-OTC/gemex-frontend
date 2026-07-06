import apiClient from './client';
import { ApiResponse } from './types';

// Trade Types
export interface Trade {
  _id: string;
  transactionId: string;
  clientId: {
    _id: string;
    fullName: string;
    email: string;
  };
  dealerId: {
    _id: string;
    fullName: string;
    email: string;
  };
  quoteId: string;
  type: 'CRYPTO_TO_NAIRA';
  cryptoAsset: 'USDT' | 'BTC' | 'USDC';
  cryptoNetwork: string;
  cryptoAmount: number;
  rate: number;
  nairaAmount: number;
  depositAddress: string;
  payoutBankCode: string;
  payoutAccountNumber: string;
  payoutAccountName: string;
  status: 'AwaitingDeposit' | 'CryptoConfirmed' | 'PayoutPending' | 'Settled' | 'Failed';
  cryptoTxHash?: string;
  fiatTxRef?: string;
  depositConfirmedAt?: string;
  payoutInitiatedAt?: string;
  payoutCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradesResponse {
  transactions: Trade[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TradeStats {
  totalTrades: number;
  totalVolume: number;
  settledTrades: number;
  pendingTrades: number;
}

export interface GetTradesParams {
  status?: string;
  quoteId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Get trades list
export const getTrades = async (params: GetTradesParams = {}): Promise<TradesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.quoteId) queryParams.append('quoteId', params.quoteId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/trades?${queryString}` : '/trades';
  
  const response = await apiClient.get<ApiResponse<TradesResponse>>(url);
  return response.data.data;
};

// Get trade by ID
export const getTradeById = async (tradeId: string): Promise<Trade> => {
  const response = await apiClient.get<ApiResponse<Trade>>(`/trades/${tradeId}`);
  return response.data.data;
};

// Get trade statistics
export const getTradeStats = async (): Promise<TradeStats> => {
  const response = await apiClient.get<ApiResponse<TradeStats>>('/trades/stats');
  return response.data.data;
};

// Trigger payout (dealer action)
export const triggerPayout = async (tradeId: string): Promise<Trade> => {
  const response = await apiClient.post<ApiResponse<Trade>>(`/trades/${tradeId}/payout`);
  return response.data.data;
};
