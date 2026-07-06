import apiClient from './client';
import { ApiResponse } from './types';

// Quote Types
export type CryptoAsset = 'USDT' | 'BTC' | 'USDC';
export type CryptoNetwork = 'TRC20' | 'BSC' | 'BASE' | 'ETH' | 'POLYGON' | 'ARBITRUM' | 'OPTIMISM' | 'BTC';
export type QuoteStatus = 'Pending' | 'Quoted' | 'Accepted' | 'Expired' | 'Rejected' | 'Canceled';

export interface Quote {
  _id: string;
  clientId: {
    _id: string;
    fullName: string;
    email: string;
  };
  cryptoAsset: CryptoAsset;
  cryptoNetwork: CryptoNetwork;
  cryptoAmount: number;
  systemRate: number;
  estimatedNaira: number;
  dealerId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  firmRate?: number;
  firmNairaAmount?: number;
  quotedAt?: string;
  expiresAt?: string;
  status: QuoteStatus;
  rejectionReason?: string;
  trade?: {
    _id: string;
    transactionId: string;
    status: string;
    depositAddress: string;
    cryptoTxId?: string;
    nairaAmount: number;
    failureReason?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotesResponse {
  quotes: Quote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateQuoteInput {
  cryptoAsset: CryptoAsset;
  cryptoNetwork: CryptoNetwork;
  cryptoAmount: number;
}

export interface GenerateQuoteInput {
  firmRate: number;
}

export interface RejectQuoteInput {
  reason?: string;
}

export interface AcceptQuoteResponse {
  quote: Quote;
  trade: {
    transactionId: string;
    depositAddress: string;
    cryptoAsset: CryptoAsset;
    cryptoNetwork: CryptoNetwork;
    cryptoAmount: number;
    rate: number;
    nairaAmount: number;
    status: string;
  };
}

export interface GetQuotesParams {
  status?: QuoteStatus;
  page?: number;
  limit?: number;
}

// Create a new quote request (Client)
export const createQuote = async (data: CreateQuoteInput): Promise<Quote> => {
  const response = await apiClient.post<ApiResponse<Quote>>('/quotes', data);
  return response.data.data;
};

// Get quotes list
export const getQuotes = async (params: GetQuotesParams = {}): Promise<QuotesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/quotes?${queryString}` : '/quotes';
  
  const response = await apiClient.get<ApiResponse<QuotesResponse>>(url);
  return response.data.data;
};

// Get quote by ID
export const getQuoteById = async (quoteId: string): Promise<Quote> => {
  const response = await apiClient.get<ApiResponse<Quote>>(`/quotes/${quoteId}`);
  return response.data.data;
};

// Generate firm quote (Dealer)
export const generateFirmQuote = async (quoteId: string, data: GenerateQuoteInput): Promise<Quote> => {
  const response = await apiClient.post<ApiResponse<Quote>>(`/quotes/${quoteId}/generate`, data);
  return response.data.data;
};

// Accept quote (Client)
export const acceptQuote = async (quoteId: string): Promise<AcceptQuoteResponse> => {
  const response = await apiClient.post<ApiResponse<AcceptQuoteResponse>>(`/quotes/${quoteId}/accept`);
  return response.data.data;
};

// Reject quote (Dealer)
export const rejectQuote = async (quoteId: string, data: RejectQuoteInput = {}): Promise<Quote> => {
  const response = await apiClient.post<ApiResponse<Quote>>(`/quotes/${quoteId}/reject`, data);
  return response.data.data;
};

// Cancel quote (Client)
export const cancelQuote = async (quoteId: string): Promise<Quote> => {
  const response = await apiClient.post<ApiResponse<Quote>>(`/quotes/${quoteId}/cancel`);
  return response.data.data;
};
