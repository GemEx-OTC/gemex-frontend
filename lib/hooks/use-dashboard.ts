'use client';

import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '@/lib/api/dashboard';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  client: () => [...dashboardKeys.all, 'client'] as const,
  dealer: () => [...dashboardKeys.all, 'dealer'] as const,
  exchangeRates: () => [...dashboardKeys.all, 'exchange-rates'] as const,
};

// Hook to get client dashboard data
export const useClientDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.client(),
    queryFn: dashboardApi.getClientDashboard,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Hook to get dealer dashboard data
export const useDealerDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.dealer(),
    queryFn: dashboardApi.getDealerDashboard,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Hook to get exchange rates
export const useExchangeRates = () => {
  return useQuery({
    queryKey: dashboardKeys.exchangeRates(),
    queryFn: dashboardApi.getExchangeRates,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
