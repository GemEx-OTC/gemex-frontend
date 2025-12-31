import apiClient from './client';
import { ApiResponse } from './types';

// Types
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'client' | 'dealer' | 'admin';
  kycStatus: string;
  emailVerified: boolean;
  isActive: boolean;
  bankAccount: BankAccount | null;
  notificationPreferences: NotificationPreferences;
  twoFactorEnabled: boolean;
  autoPayoutEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface BankAccount {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
}

export interface NotificationPreferences {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  tradeAlerts?: boolean;
  quoteAlerts?: boolean;
  priceAlerts?: boolean;
}

export interface UpdateProfileInput {
  fullName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateBankAccountInput {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface VerifyBankAccountInput {
  bankCode: string;
  accountNumber: string;
}

export interface VerifyBankAccountResponse {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  verified: boolean;
}

export interface DealerRates {
  USDT_NGN: number;
  USDC_NGN: number;
  BTC_NGN: number;
  lastUpdated: string;
}

export interface UpdateDealerRatesInput {
  USDT_NGN?: number;
  USDC_NGN?: number;
  BTC_NGN?: number;
}

export interface ExchangeRates {
  USDT_NGN: number;
  USDC_NGN: number;
  BTC_USD: number;
  USD_NGN: number;
  BTC_NGN: number;
  lastUpdated: string;
}

export interface UpdateExchangeRatesInput {
  USDT_NGN?: number;
  USDC_NGN?: number;
  BTC_USD?: number;
  USD_NGN?: number;
  BTC_NGN?: number;
}

// ============ PROFILE APIs ============

export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/user-settings/profile');
  return response.data.data;
};

export const updateProfile = async (data: UpdateProfileInput): Promise<UserProfile> => {
  const response = await apiClient.put<ApiResponse<UserProfile>>('/user-settings/profile', data);
  return response.data.data;
};

export const changePassword = async (data: ChangePasswordInput): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/user-settings/change-password', data);
  return response.data.data;
};

// ============ NOTIFICATION APIs ============

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get<ApiResponse<NotificationPreferences>>('/user-settings/notifications');
  return response.data.data;
};

export const updateNotificationPreferences = async (data: NotificationPreferences): Promise<NotificationPreferences> => {
  const response = await apiClient.put<ApiResponse<NotificationPreferences>>('/user-settings/notifications', data);
  return response.data.data;
};

// ============ SECURITY APIs ============

export const toggleTwoFactor = async (enabled: boolean): Promise<{ twoFactorEnabled: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ twoFactorEnabled: boolean }>>('/user-settings/two-factor', { enabled });
  return response.data.data;
};

// ============ BANK ACCOUNT APIs ============

export const getBankAccount = async (): Promise<BankAccount | null> => {
  const response = await apiClient.get<ApiResponse<BankAccount | null>>('/user-settings/bank-account');
  return response.data.data;
};

export const updateBankAccount = async (data: UpdateBankAccountInput): Promise<BankAccount> => {
  const response = await apiClient.put<ApiResponse<BankAccount>>('/user-settings/bank-account', data);
  return response.data.data;
};

export const verifyBankAccount = async (data: VerifyBankAccountInput): Promise<VerifyBankAccountResponse> => {
  const response = await apiClient.post<ApiResponse<VerifyBankAccountResponse>>('/user-settings/verify-bank', data);
  return response.data.data;
};

// ============ DEALER APIs ============

export const getDealerRates = async (): Promise<DealerRates> => {
  const response = await apiClient.get<ApiResponse<DealerRates>>('/user-settings/dealer/rates');
  return response.data.data;
};

export const updateDealerRates = async (data: UpdateDealerRatesInput): Promise<DealerRates> => {
  const response = await apiClient.put<ApiResponse<DealerRates>>('/user-settings/dealer/rates', data);
  return response.data.data;
};

// ============ ADMIN APIs ============

export const getGlobalExchangeRates = async (): Promise<ExchangeRates> => {
  const response = await apiClient.get<ApiResponse<ExchangeRates>>('/user-settings/admin/exchange-rates');
  return response.data.data;
};

export const updateGlobalExchangeRates = async (data: UpdateExchangeRatesInput): Promise<ExchangeRates> => {
  const response = await apiClient.put<ApiResponse<ExchangeRates>>('/user-settings/admin/exchange-rates', data);
  return response.data.data;
};

// ============ OTP APIs ============

export type OtpActionType = 'password' | 'bank_account' | 'phone_number' | 'quote_rates' | 'exchange_rates';

export interface SendOtpInput {
  actionType: OtpActionType;
}

export interface VerifyOtpInput {
  code: string;
  actionType: OtpActionType;
}

export const sendOtp = async (data: SendOtpInput): Promise<{ message: string; expiresAt: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string; expiresAt: string }>>('/user-settings/otp/send', data);
  return response.data.data;
};

export const verifyOtp = async (data: VerifyOtpInput): Promise<{ verified: boolean; token: string }> => {
  const response = await apiClient.post<ApiResponse<{ verified: boolean; token: string }>>('/user-settings/otp/verify', data);
  return response.data.data;
};

// ============ PASSWORD VERIFICATION API ============

export interface VerifyPasswordInput {
  password: string;
}

export const verifyUserPassword = async (data: VerifyPasswordInput): Promise<{ valid: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ valid: boolean }>>('/user-settings/verify-password', data);
  return response.data.data;
};


// ============ AUTO PAYOUT APIs ============

export const getAutoPayoutStatus = async (): Promise<{ autoPayoutEnabled: boolean }> => {
  const response = await apiClient.get<ApiResponse<{ autoPayoutEnabled: boolean }>>('/user-settings/auto-payout');
  return response.data.data;
};

export const toggleAutoPayout = async (enabled: boolean): Promise<{ autoPayoutEnabled: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ autoPayoutEnabled: boolean }>>('/user-settings/auto-payout', { enabled });
  return response.data.data;
};
