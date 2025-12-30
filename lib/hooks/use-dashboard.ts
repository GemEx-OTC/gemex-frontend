'use client';

import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '@/lib/api/dashboard';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  client: () => [...dashboardKeys.all, 'client'] as const,
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
