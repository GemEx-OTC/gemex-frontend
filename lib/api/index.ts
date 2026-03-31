export * from './types';
export * from './auth';
export * from './kyc';

// Explicitly export from admin to avoid conflicts with user-settings
export * from './admin';

// Explicitly export from dashboard
export * from './dashboard';

// Selective exports from user-settings to avoid collisions with auth and admin
export {
  getNotificationPreferences,
  updateNotificationPreferences,
  toggleTwoFactor,
  getBankAccount,
  updateBankAccount,
  verifyBankAccount,
  getDealerRates,
  updateDealerRates,
  getGlobalExchangeRates,
  updateGlobalExchangeRates,
  getAutoPayoutStatus,
  toggleAutoPayout,
  getBanks,
  sendPhoneOtp,
  verifyPhoneOtp,
  verifyIdentity,
  verifyCac,
  // Mapping conflicting names if needed, or skipping if they should come from auth
  getProfile as getUserSettingsProfile,
  updateProfile as updateUserSettingsProfile,
  changePassword as changeUserSettingsPassword
} from './user-settings';

export type {
  UserProfile,
  BankAccount,
  NotificationPreferences,
  VerifyBankAccountResponse,
  DealerRates,
  UpdateDealerRatesInput,
  UpdateExchangeRatesInput,
  BtcPriceInfo
} from './user-settings';

export * from './notifications';

export { 
  getMemos, 
  getMemoById, 
  createMemo, 
  addReply, 
  updateMemoStatus, 
  assignMemo, 
  getAdmins,
  getDealers as getMemoDealers,
  getUnreadCount as getUnreadMemoCount
} from './memos';

export type { 
  MemoStatus, MemoPriority, MemoCategory, MemoUser, MemoReply, 
  Memo, MemoStats, MemoFilters, MemosResponse, CreateMemoInput, Assignee 
} from './memos';

export * from './quotes';
export * from './trades';
export { apiClient, setTokens, getTokens, clearTokens } from './client';
