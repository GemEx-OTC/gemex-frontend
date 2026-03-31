'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userSettingsApi from '@/lib/api/user-settings';
import type {
  NotificationPreferences,
  UpdateBankAccountInput,
  VerifyBankAccountInput,
  UpdateDealerRatesInput,
  UpdateExchangeRatesInput,
} from '@/lib/api/user-settings';
import { UpdateProfileInput, ChangePasswordInput } from '@/lib/api/types';

// Query keys
export const userSettingsKeys = {
  all: ['user-settings'] as const,
  profile: () => [...userSettingsKeys.all, 'profile'] as const,
  notifications: () => [...userSettingsKeys.all, 'notifications'] as const,
  bankAccount: () => [...userSettingsKeys.all, 'bank-account'] as const,
  dealerRates: () => [...userSettingsKeys.all, 'dealer-rates'] as const,
  exchangeRates: () => [...userSettingsKeys.all, 'exchange-rates'] as const,
  autoPayout: () => [...userSettingsKeys.all, 'auto-payout'] as const,
  banks: () => [...userSettingsKeys.all, 'banks'] as const,
};

// ============ PROFILE HOOKS ============

export const useUserSettingsProfile = () => {
  return useQuery({
    queryKey: userSettingsKeys.profile(),
    queryFn: userSettingsApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserSettingsProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => userSettingsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};

export const useChangeUserSettingsPassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => userSettingsApi.changePassword(data),
  });
};

// ============ NOTIFICATION HOOKS ============

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: userSettingsKeys.notifications(),
    queryFn: userSettingsApi.getNotificationPreferences,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: NotificationPreferences) => userSettingsApi.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};

// ============ SECURITY HOOKS ============

export const useToggleTwoFactor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enabled: boolean) => userSettingsApi.toggleTwoFactor(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};

// ============ BANK ACCOUNT HOOKS ============

export const useBankAccount = () => {
  return useQuery({
    queryKey: userSettingsKeys.bankAccount(),
    queryFn: userSettingsApi.getBankAccount,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateBankAccountInput) => userSettingsApi.updateBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.bankAccount() });
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};

export const useVerifyBankAccount = () => {
  return useMutation({
    mutationFn: (data: VerifyBankAccountInput) => userSettingsApi.verifyBankAccount(data),
  });
};

export const useBanks = () => {
  return useQuery({
    queryKey: userSettingsKeys.banks(),
    queryFn: userSettingsApi.getBanks,
    staleTime: 24 * 60 * 60 * 1000,
  });
};

// ============ DEALER HOOKS ============

export const useDealerRates = () => {
  return useQuery({
    queryKey: userSettingsKeys.dealerRates(),
    queryFn: userSettingsApi.getDealerRates,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useUpdateDealerRates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateDealerRatesInput) => userSettingsApi.updateDealerRates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.dealerRates() });
    },
  });
};

// ============ ADMIN HOOKS ============

export const useGlobalExchangeRates = () => {
  return useQuery({
    queryKey: userSettingsKeys.exchangeRates(),
    queryFn: userSettingsApi.getGlobalExchangeRates,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useBtcPriceInfo = () => {
  return useQuery({
    queryKey: [...userSettingsKeys.all, 'btc-price'] as const,
    queryFn: userSettingsApi.getBtcPriceInfo,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

export const useUpdateGlobalExchangeRates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateExchangeRatesInput) => userSettingsApi.updateGlobalExchangeRates(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.exchangeRates() });
    },
  });
};

// ============ OTP HOOKS ============

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (data: userSettingsApi.SendOtpInput) => userSettingsApi.sendOtp(data),
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: userSettingsApi.VerifyOtpInput) => userSettingsApi.verifyOtp(data),
  });
};

export const useSendPhoneOtp = () => {
  return useMutation({
    mutationFn: (phoneNumber: string) => userSettingsApi.sendPhoneOtp(phoneNumber),
  });
};

export const useVerifyPhoneOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { phoneNumber: string; otp: string }) => userSettingsApi.verifyPhoneOtp(data.phoneNumber, data.otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};

export const useVerifyIdentity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { idType: string; idNumber: string }) => userSettingsApi.verifyIdentity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};

export const useVerifyCac = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rcNumber: string) => userSettingsApi.verifyCac(rcNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};

// ============ PASSWORD VERIFICATION HOOK ============

export const useVerifyPassword = () => {
  return useMutation({
    mutationFn: (data: userSettingsApi.VerifyPasswordInput) => userSettingsApi.verifyUserPassword(data),
  });
};


// ============ AUTO PAYOUT HOOKS ============

export const useAutoPayoutStatus = () => {
  return useQuery({
    queryKey: userSettingsKeys.autoPayout(),
    queryFn: userSettingsApi.getAutoPayoutStatus,
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleAutoPayout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enabled: boolean) => userSettingsApi.toggleAutoPayout(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.autoPayout() });
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.profile() });
    },
  });
};
