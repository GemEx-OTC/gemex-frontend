'use client';

import { useState, useEffect, useCallback } from 'react';
import * as memosApi from '@/lib/api/memos';
import type { 
  Memo, 
  MemoFilters, 
  MemoStats,
  MemoStatus,
  CreateMemoInput,
  Assignee,
} from '@/lib/api/memos';

interface UseMemosOptions {
  autoFetch?: boolean;
  pollInterval?: number;
  filters?: MemoFilters;
}

interface UseMemosReturn {
  memos: Memo[];
  stats: MemoStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
  loading: boolean;
  error: string | null;
  selectedMemo: Memo | null;
  dealers: Assignee[];
  admins: Assignee[];
  // Actions
  fetchMemos: (filters?: MemoFilters) => Promise<void>;
  fetchMemoById: (memoId: string) => Promise<void>;
  createMemo: (data: CreateMemoInput) => Promise<Memo>;
  addReply: (memoId: string, message: string) => Promise<void>;
  updateStatus: (memoId: string, status: MemoStatus) => Promise<void>;
  assignMemo: (memoId: string, assigneeId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  fetchDealers: () => Promise<void>;
  fetchAdmins: () => Promise<void>;
  setSelectedMemo: (memo: Memo | null) => void;
  setPage: (page: number) => void;
  clearError: () => void;
}

export function useMemos(options: UseMemosOptions = {}): UseMemosReturn {
  const { autoFetch = true, pollInterval = 0, filters: initialFilters = {} } = options;

  const [memos, setMemos] = useState<Memo[]>([]);
  const [stats, setStats] = useState<MemoStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  });
  const [pagination, setPagination] = useState({
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 20,
    total: 0,
    pages: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [dealers, setDealers] = useState<Assignee[]>([]);
  const [admins, setAdmins] = useState<Assignee[]>([]);
  const [currentFilters, setCurrentFilters] = useState<MemoFilters>(initialFilters);

  const fetchMemos = useCallback(async (filters?: MemoFilters) => {
    setLoading(true);
    setError(null);
    try {
      const mergedFilters = { ...currentFilters, ...filters };
      setCurrentFilters(mergedFilters);
      
      const response = await memosApi.getMemos(mergedFilters);
      setMemos(response.memos);
      setStats(response.stats);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch memos');
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const fetchMemoById = useCallback(async (memoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const memo = await memosApi.getMemoById(memoId);
      setSelectedMemo(memo);
      // Update memo in list if exists
      setMemos(prev => prev.map(m => m._id === memoId ? memo : m));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch memo');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMemo = useCallback(async (data: CreateMemoInput): Promise<Memo> => {
    setError(null);
    try {
      const memo = await memosApi.createMemo(data);
      setMemos(prev => [memo, ...prev]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        open: prev.open + 1,
        urgent: data.priority === 'urgent' ? prev.urgent + 1 : prev.urgent,
      }));
      return memo;
    } catch (err: any) {
      setError(err.message || 'Failed to create memo');
      throw err;
    }
  }, []);

  const addReply = useCallback(async (memoId: string, message: string) => {
    setError(null);
    try {
      const updatedMemo = await memosApi.addReply(memoId, message);
      setMemos(prev => prev.map(m => m._id === memoId ? updatedMemo : m));
      if (selectedMemo?._id === memoId) {
        setSelectedMemo(updatedMemo);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add reply');
      throw err;
    }
  }, [selectedMemo]);

  const updateStatus = useCallback(async (memoId: string, status: MemoStatus) => {
    setError(null);
    try {
      const updatedMemo = await memosApi.updateMemoStatus(memoId, status);
      setMemos(prev => prev.map(m => m._id === memoId ? updatedMemo : m));
      if (selectedMemo?._id === memoId) {
        setSelectedMemo(updatedMemo);
      }
      // Refresh stats
      fetchMemos(currentFilters);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      throw err;
    }
  }, [selectedMemo, fetchMemos, currentFilters]);

  const assignMemo = useCallback(async (memoId: string, assigneeId: string) => {
    setError(null);
    try {
      const updatedMemo = await memosApi.assignMemo(memoId, assigneeId);
      setMemos(prev => prev.map(m => m._id === memoId ? updatedMemo : m));
      if (selectedMemo?._id === memoId) {
        setSelectedMemo(updatedMemo);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign memo');
      throw err;
    }
  }, [selectedMemo]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await memosApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  const fetchDealers = useCallback(async () => {
    try {
      const data = await memosApi.getDealers();
      setDealers(data);
    } catch (err: any) {
      console.error('Failed to fetch dealers:', err);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const data = await memosApi.getAdmins();
      setAdmins(data);
    } catch (err: any) {
      console.error('Failed to fetch admins:', err);
    }
  }, []);

  const setPage = useCallback((page: number) => {
    fetchMemos({ ...currentFilters, page });
  }, [fetchMemos, currentFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Silent background refresh (doesn't show loading state)
  const silentRefresh = useCallback(async () => {
    try {
      const response = await memosApi.getMemos(currentFilters);
      setMemos(response.memos);
      setStats(response.stats);
      setPagination(response.pagination);
      
      const count = await memosApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      // Silent fail for background polling
      console.error('Background refresh failed:', err);
    }
  }, [currentFilters]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchMemos();
      refreshUnreadCount();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling - silently refresh full memo list
  useEffect(() => {
    if (pollInterval > 0) {
      const interval = setInterval(() => {
        silentRefresh();
      }, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval, silentRefresh]);

  return {
    memos,
    stats,
    pagination,
    unreadCount,
    loading,
    error,
    selectedMemo,
    dealers,
    admins,
    fetchMemos,
    fetchMemoById,
    createMemo,
    addReply,
    updateStatus,
    assignMemo,
    refreshUnreadCount,
    fetchDealers,
    fetchAdmins,
    setSelectedMemo,
    setPage,
    clearError,
  };
}

export default useMemos;
