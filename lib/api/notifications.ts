import apiClient from './client';
import { ApiResponse } from './types';

// ============ TYPES ============

export type NotificationType =
  | 'QuoteGenerated'
  | 'QuoteAccepted'
  | 'QuoteRejected'
  | 'QuoteExpired'
  | 'DepositConfirmed'
  | 'PayoutSuccess'
  | 'PayoutFailed'
  | 'AccountStatusChange'
  | 'KycStatusChange'
  | 'AdminAction'
  | 'RateUpdated'
  | 'TradeCreated'
  | 'SystemAlert'
  | 'SecurityAlert'
  | 'WelcomeMessage';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: {
    inApp: { sent: boolean; readAt?: string };
    email: { sent: boolean; sentAt?: string };
    sms: { sent: boolean; sentAt?: string };
  };
  referenceType?: 'Quote' | 'Trade' | 'User' | 'KYC' | 'Wallet' | 'System';
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  type?: NotificationType;
  types?: NotificationType[];
  priority?: NotificationPriority;
  referenceType?: string;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
  unreadByPriority: Record<NotificationPriority, number>;
}

export interface SystemNotificationStats {
  total: number;
  todayCount: number;
  unreadTotal: number;
  byType: Record<NotificationType, number>;
  byRole: Record<string, number>;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  referenceType?: 'Quote' | 'Trade' | 'User' | 'KYC' | 'Wallet' | 'System';
  referenceId?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  sendSms?: boolean;
}

export interface BulkNotificationInput {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  referenceType?: 'Quote' | 'Trade' | 'User' | 'KYC' | 'Wallet' | 'System';
  referenceId?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  sendSms?: boolean;
}

export interface NotifyByRoleInput {
  role: 'client' | 'dealer' | 'admin';
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  referenceType?: 'Quote' | 'Trade' | 'User' | 'KYC' | 'Wallet' | 'System';
  referenceId?: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  sendSms?: boolean;
}

// ============ USER APIs ============

export const getNotifications = async (filters: NotificationFilters = {}): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.unreadOnly) params.append('unreadOnly', 'true');
  if (filters.type) params.append('type', filters.type);
  if (filters.types?.length) params.append('types', filters.types.join(','));
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.referenceType) params.append('referenceType', filters.referenceType);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/notifications?${queryString}` : '/notifications';
  
  const response = await apiClient.get<ApiResponse<NotificationsResponse>>(url);
  return response.data.data;
};

export const getNotificationStats = async (): Promise<NotificationStats> => {
  const response = await apiClient.get<ApiResponse<NotificationStats>>('/notifications/stats');
  return response.data.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
  return response.data.data.unreadCount;
};

export const markAsRead = async (notificationId: string): Promise<Notification> => {
  const response = await apiClient.put<ApiResponse<Notification>>(`/notifications/${notificationId}/read`);
  return response.data.data;
};

export const markMultipleAsRead = async (notificationIds: string[]): Promise<{ markedCount: number }> => {
  const response = await apiClient.put<ApiResponse<{ markedCount: number }>>('/notifications/read-multiple', {
    notificationIds,
  });
  return response.data.data;
};

export const markAllAsRead = async (type?: NotificationType): Promise<{ markedCount: number }> => {
  const url = type ? `/notifications/read-all?type=${type}` : '/notifications/read-all';
  const response = await apiClient.put<ApiResponse<{ markedCount: number }>>(url);
  return response.data.data;
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  await apiClient.delete(`/notifications/${notificationId}`);
};

export const cleanupOldNotifications = async (daysOld: number = 30): Promise<{ deletedCount: number }> => {
  const response = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
    `/notifications/cleanup?daysOld=${daysOld}`
  );
  return response.data.data;
};

// ============ ADMIN APIs ============

export const adminGetAllNotifications = async (
  filters: NotificationFilters & { userId?: string } = {}
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.unreadOnly) params.append('unreadOnly', 'true');
  if (filters.type) params.append('type', filters.type);
  if (filters.types?.length) params.append('types', filters.types.join(','));
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/notifications/admin/all?${queryString}` : '/notifications/admin/all';
  
  const response = await apiClient.get<ApiResponse<NotificationsResponse>>(url);
  return response.data.data;
};

export const adminGetSystemStats = async (): Promise<SystemNotificationStats> => {
  const response = await apiClient.get<ApiResponse<SystemNotificationStats>>('/notifications/admin/stats');
  return response.data.data;
};

export const adminCreateNotification = async (data: CreateNotificationInput): Promise<Notification> => {
  const response = await apiClient.post<ApiResponse<Notification>>('/notifications/admin/create', data);
  return response.data.data;
};

export const adminCreateBulkNotifications = async (data: BulkNotificationInput): Promise<{ createdCount: number }> => {
  const response = await apiClient.post<ApiResponse<{ createdCount: number }>>('/notifications/admin/bulk', data);
  return response.data.data;
};

export const adminNotifyByRole = async (data: NotifyByRoleInput): Promise<{ createdCount: number }> => {
  const response = await apiClient.post<ApiResponse<{ createdCount: number }>>('/notifications/admin/notify-role', data);
  return response.data.data;
};
