'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import { getTokens, clearTokens } from '@/lib/api/client';
import type {
  LoginInput,
  RegisterInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  ChangePasswordInput,
  ResendOtpInput,
  ApiError,
} from '@/lib/api/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Hook to get current user profile
export const useProfile = () => {
  const { accessToken } = getTokens();
  
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Hook for user registration
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
  });
};

// Hook for email verification
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: VerifyEmailInput) => authApi.verifyEmail(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile(), data.user);
      // Redirect based on role
      const redirectPath = data.user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
      router.push(redirectPath);
    },
  });
};

// Hook for resending OTP
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (data: ResendOtpInput) => authApi.resendOtp(data),
  });
};

// Hook for user login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile(), data.user);
      // Redirect based on role
      let redirectPath = '/client/dashboard';
      if (data.user.role === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (data.user.role === 'dealer') {
        redirectPath = '/dealer/dashboard';
      }
      router.push(redirectPath);
    },
  });
};

// Hook for user logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      router.push('/auth/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      clearTokens();
      queryClient.clear();
      router.push('/auth/login');
    },
  });
};

// Hook for forgot password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => authApi.forgotPassword(data),
  });
};

// Hook for reset password
export const useResetPassword = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: ResetPasswordInput) => authApi.resetPassword(data),
    onSuccess: () => {
      router.push('/auth/login');
    },
  });
};

// Hook for updating profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => authApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
};

// Hook for updating settings
export const useUpdateSettings = () => {
  return useMutation({
    mutationFn: (data: UpdateSettingsInput) => authApi.updateSettings(data),
  });
};

// Hook for changing password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => authApi.changePassword(data),
  });
};

// Hook for setting new password (dealers with temp password)
export const useSetNewPassword = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ newPassword, tempToken }: { newPassword: string; tempToken: string }) => 
      authApi.setNewPassword(newPassword, tempToken),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.profile(), data.user);
      // Redirect to dealer dashboard
      router.push('/dealer/dashboard');
    },
  });
};

// Helper hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { accessToken } = getTokens();
  const { data: profile, isLoading } = useProfile();
  
  return {
    isAuthenticated: !!accessToken && !!profile,
    isLoading,
    user: profile,
  };
};
