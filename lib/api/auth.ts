import apiClient, { setTokens, clearTokens } from './client';
import {
  ApiResponse,
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  VerifyEmailInput,
  VerifyEmailResponse,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
  UpdateSettingsInput,
  ChangePasswordInput,
  ResendOtpInput,
  User,
} from './types';

// Register a new user
export const register = async (data: RegisterInput): Promise<RegisterResponse> => {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', data);
  return response.data.data;
};

// Verify email with OTP
export const verifyEmail = async (data: VerifyEmailInput): Promise<VerifyEmailResponse> => {
  const response = await apiClient.post<ApiResponse<VerifyEmailResponse>>('/auth/verify-email', data);
  const { accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);
  return response.data.data;
};

// Resend OTP for email verification
export const resendOtp = async (data: ResendOtpInput): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-otp', data);
  return response.data.data;
};

// Login user
export const login = async (data: LoginInput): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
  const { accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);
  return response.data.data;
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearTokens();
  }
};

// Forgot password
export const forgotPassword = async (data: ForgotPasswordInput): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data);
  return response.data.data;
};

// Reset password
export const resetPassword = async (data: ResetPasswordInput): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
  return response.data.data;
};

// Get user profile
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
  return response.data.data;
};

// Update user profile
export const updateProfile = async (data: UpdateProfileInput): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
  return response.data.data;
};

// Update user settings
export const updateSettings = async (data: UpdateSettingsInput): Promise<UpdateSettingsInput> => {
  const response = await apiClient.put<ApiResponse<UpdateSettingsInput>>('/auth/settings', data);
  return response.data.data;
};

// Change password
export const changePassword = async (data: ChangePasswordInput): Promise<{ message: string }> => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', data);
  return response.data.data;
};

// Set new password (for dealers with temp password)
export const setNewPassword = async (newPassword: string, tempToken: string): Promise<LoginResponse> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    '/auth/set-new-password', 
    { newPassword },
    { headers: { Authorization: `Bearer ${tempToken}` } }
  );
  const { accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);
  return response.data.data;
};
