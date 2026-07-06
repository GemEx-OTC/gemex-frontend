'use client';

import { useState, useEffect, useCallback } from 'react';
import * as notificationsApi from '@/lib/api/notifications';
import type { 
  Notification, 
  NotificationFilters, 
  NotificationStats,
  NotificationType 
} from '@/lib/api/notifications';
import { toast } from 'sonner';
import { useSocketContext } from '@/lib/providers/socket-provider';

interface UseNotificationsOptions {
  autoFetch?: boolean;
  pollInterval?: number; // in milliseconds, 0 to disable
  filters?: NotificationFilters;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markMultipleAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: (type?: NotificationType) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  setPage: (page: number) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { autoFetch = true, pollInterval = 0, filters: initialFilters = {} } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [pagination, setPagination] = useState({
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<NotificationFilters>(initialFilters);

  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    setLoading(true);
    setError(null);
    try {
      const mergedFilters = { ...currentFilters, ...filters };
      setCurrentFilters(mergedFilters);
      
      const response = await notificationsApi.getNotifications(mergedFilters);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await notificationsApi.getNotificationStats();
      setStats(response);
    } catch (err: any) {
      console.error('Failed to fetch notification stats:', err);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId
            ? { ...n, channels: { ...n.channels, inApp: { ...n.channels.inApp, readAt: new Date().toISOString() } } }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification as read');
      throw err;
    }
  }, []);

  const markMultipleAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const result = await notificationsApi.markMultipleAsRead(notificationIds);
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n._id)
            ? { ...n, channels: { ...n.channels, inApp: { ...n.channels.inApp, readAt: new Date().toISOString() } } }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - result.markedCount));
    } catch (err: any) {
      setError(err.message || 'Failed to mark notifications as read');
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async (type?: NotificationType) => {
    try {
      await notificationsApi.markAllAsRead(type);
      setNotifications(prev =>
        prev.map(n => {
          if (type && n.type !== type) return n;
          return { ...n, channels: { ...n.channels, inApp: { ...n.channels.inApp, readAt: new Date().toISOString() } } };
        })
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to mark all notifications as read');
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n._id === notificationId);
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (notification && !notification.channels.inApp.readAt) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete notification');
      throw err;
    }
  }, [notifications]);

  const setPage = useCallback((page: number) => {
    fetchNotifications({ ...currentFilters, page });
  }, [fetchNotifications, currentFilters]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling for new notifications
  useEffect(() => {
    if (pollInterval > 0) {
      const interval = setInterval(() => {
        refreshUnreadCount();
      }, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, refreshUnreadCount]);

  // Real-time notifications via WebSockets
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: { notification: Notification }) => {
      const { notification } = data;
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast(notification.title, {
        description: notification.message,
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  return {
    notifications,
    unreadCount,
    stats,
    pagination,
    loading,
    error,
    fetchNotifications,
    fetchStats,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    setPage,
  };
}

// Hook for admin notification management
interface UseAdminNotificationsReturn extends UseNotificationsReturn {
  systemStats: notificationsApi.SystemNotificationStats | null;
  fetchSystemStats: () => Promise<void>;
  createNotification: (data: notificationsApi.CreateNotificationInput) => Promise<void>;
  createBulkNotifications: (data: notificationsApi.BulkNotificationInput) => Promise<number>;
  notifyByRole: (data: notificationsApi.NotifyByRoleInput) => Promise<number>;
}

export function useAdminNotifications(options: UseNotificationsOptions = {}): UseAdminNotificationsReturn {
  const baseHook = useNotifications(options);
  const [systemStats, setSystemStats] = useState<notificationsApi.SystemNotificationStats | null>(null);

  const fetchSystemStats = useCallback(async () => {
    try {
      const stats = await notificationsApi.adminGetSystemStats();
      setSystemStats(stats);
    } catch (err: any) {
      console.error('Failed to fetch system stats:', err);
    }
  }, []);

  const createNotification = useCallback(async (data: notificationsApi.CreateNotificationInput) => {
    await notificationsApi.adminCreateNotification(data);
    baseHook.fetchNotifications();
  }, [baseHook]);

  const createBulkNotifications = useCallback(async (data: notificationsApi.BulkNotificationInput) => {
    const result = await notificationsApi.adminCreateBulkNotifications(data);
    baseHook.fetchNotifications();
    return result.createdCount;
  }, [baseHook]);

  const notifyByRole = useCallback(async (data: notificationsApi.NotifyByRoleInput) => {
    const result = await notificationsApi.adminNotifyByRole(data);
    baseHook.fetchNotifications();
    return result.createdCount;
  }, [baseHook]);

  return {
    ...baseHook,
    systemStats,
    fetchSystemStats,
    createNotification,
    createBulkNotifications,
    notifyByRole,
  };
}

export default useNotifications;
