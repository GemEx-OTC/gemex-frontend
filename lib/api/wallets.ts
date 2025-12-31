import apiClient from './client';
import { ApiResponse } from './types';

export interface WalletInfo {
  network: string;
  address: string;
  assets: string[];
  confirmations: number;
  avgTime: string;
  fees: string;
}

export interface WalletsResponse {
  wallets: WalletInfo[];
  created: boolean;
}

export interface NetworkInfo {
  network: string;
  assets: string[];
  confirmations: number;
  avgTime: string;
  fees: string;
}

// Get user's wallets (creates them if they don't exist)
export const getMyWallets = async (): Promise<WalletsResponse> => {
  const response = await apiClient.get<ApiResponse<WalletsResponse>>('/wallets/my-wallets');
  return response.data.data;
};

// Get wallet addresses only (doesn't create)
export const getWalletAddresses = async (): Promise<WalletInfo[]> => {
  const response = await apiClient.get<ApiResponse<WalletInfo[]>>('/wallets/addresses');
  return response.data.data;
};

// Create wallets
export const createWallets = async (): Promise<WalletsResponse> => {
  const response = await apiClient.post<ApiResponse<WalletsResponse>>('/wallets/addresses');
  return response.data.data;
};

// Get network info
export const getNetworksInfo = async (): Promise<NetworkInfo[]> => {
  const response = await apiClient.get<ApiResponse<NetworkInfo[]>>('/wallets/networks');
  return response.data.data;
};
