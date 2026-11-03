import apiClient from './client';
import { ApiResponse } from './types';

export interface ReferralStats {
  balance: number;
  minWithdrawal: number;
  canWithdraw: boolean;
  rewardRate: {
    tradeUSD: number;
    bonusNGN: number;
  };
  referralCode: string;
  referralStatus: 'active' | 'suspended';
  totalEarned: number;
  totalVolumeUSD: number;
  referralCount: number;
  referralBankAccount: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isVerified: boolean;
  } | null;
  bankAccount: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isVerified: boolean;
  } | null;
}

export interface ReferralBonusItem {
  id: string;
  refereeName: string;
  cryptoAsset: 'USDT' | 'USDC' | 'BTC';
  cryptoAmount: number;
  amountUSD: number;
  amountUSDT: number;
  bonusNGN: number;
  status: 'earned' | 'withdrawn';
  createdAt: string;
}

export interface ReferralWithdrawalItem {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  bankAccount: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  fiatTxRef?: string;
  failureReason?: string;
  createdAt: string;
}

export const getReferralStats = async (): Promise<ReferralStats> => {
  const response = await apiClient.get<ApiResponse<ReferralStats>>('/referrals/stats');
  return response.data.data;
};

export const getReferralHistory = async (page = 1, limit = 20): Promise<{
  bonuses: ReferralBonusItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await apiClient.get<ApiResponse<{
    bonuses: ReferralBonusItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>>(`/referrals/history?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const getReferralWithdrawals = async (page = 1, limit = 20): Promise<{
  withdrawals: ReferralWithdrawalItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const response = await apiClient.get<ApiResponse<{
    withdrawals: ReferralWithdrawalItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>>(`/referrals/withdrawals?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const withdrawReferralBalance = async (amount: number): Promise<{
  id: string;
  amount: number;
  status: string;
  fiatTxRef?: string;
}> => {
  const response = await apiClient.post<ApiResponse<{
    id: string;
    amount: number;
    status: string;
    fiatTxRef?: string;
  }>>('/referrals/withdraw', { amount });
  return response.data.data;
};

export const getReferralBanks = async (): Promise<{ code: string; name: string }[]> => {
  const response = await apiClient.get<ApiResponse<{ code: string; name: string }[]>>('/referrals/banks');
  return response.data.data;
};

export const verifyReferralPayoutAccount = async (accountNumber: string, bankCode: string): Promise<{
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}> => {
  const response = await apiClient.post<ApiResponse<{
    accountNumber: string;
    accountName: string;
    bankCode: string;
    bankName: string;
  }>>('/referrals/verify-payout-account', { accountNumber, bankCode });
  return response.data.data;
};

export const updateReferralPayoutAccount = async (data: {
  accountNumber: string;
  bankCode: string;
  bankName?: string;
  accountName?: string;
}): Promise<{
  message: string;
  referralBankAccount: any;
}> => {
  const response = await apiClient.post<ApiResponse<{
    message: string;
    referralBankAccount: any;
  }>>('/referrals/payout-account', data);
  return response.data.data;
};
