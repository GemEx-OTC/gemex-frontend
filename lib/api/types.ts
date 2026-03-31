// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'dealer' | 'admin';
  kycStatus: 'Pending' | 'Submitted' | 'Verified' | 'Rejected';
  emailVerified: boolean;
  phoneNumber?: string;
  bankVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}

export interface VerifyEmailResponse extends AuthTokens {
  user: User;
}

// Input Types
export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phoneNumber?: string;
}

export interface UpdateSettingsInput {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  tradeAlerts?: boolean;
  priceAlerts?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResendOtpInput {
  email: string;
}

export interface SetNewPasswordInput {
  newPassword: string;
}

// API Error
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  data?: {
    email?: string;
    accessToken?: string;
    userId?: string;
    [key: string]: any;
  };
}
// QoreID SDK types
export interface QoreIDSuccessResponse {
  status: string;
  verificationId: string;
  data?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    documentNumber?: string;
    [key: string]: any;
  };
}

export interface QoreIDError {
  code: string;
  message: string;
}

export interface QoreIDConfig {
  clientId: string;
  flowId?: string;
  productCode: string;
  customerReference: string;
  applicantData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  onSuccess: (response: QoreIDSuccessResponse) => void;
  onClose: () => void;
  onError: (error: QoreIDError) => void;
}

declare global {
  interface Window {
    QoreIDSDK?: {
      initialize: (config: QoreIDConfig) => void;
    };
  }
}
