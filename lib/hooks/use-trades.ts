'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tradesApi from '@/lib/api/trades';
import type { GetTradesParams } from '@/lib/api/trades';

// Query keys
export const tradesKeys = {
  all: ['trades'] as const,
  lists: () => [...tradesKeys.all, 'list'] as const,
  list: (params: GetTradesParams) => [...tradesKeys.lists(), params] as const,
  details: () => [...tradesKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradesKeys.details(), id] as const,
  stats: () => [...tradesKeys.all, 'stats'] as const,
};

// Hook to get trades list
export const useTrades = (params: GetTradesParams = {}) => {
  return useQuery({
    queryKey: tradesKeys.list(params),
    queryFn: () => tradesApi.getTrades(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get trade by ID
export const useTradeById = (tradeId: string) => {
  return useQuery({
    queryKey: tradesKeys.detail(tradeId),
    queryFn: () => tradesApi.getTradeById(tradeId),
    enabled: !!tradeId,
  });
};

// Hook to get trade statistics
export const useTradeStats = () => {
  return useQuery({
    queryKey: tradesKeys.stats(),
    queryFn: tradesApi.getTradeStats,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook to trigger payout
export const useTriggerPayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) => tradesApi.triggerPayout(tradeId),
    onSuccess: () => {
      // Invalidate trades list and stats
      queryClient.invalidateQueries({ queryKey: tradesKeys.all });
    },
  });
};
