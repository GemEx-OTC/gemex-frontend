import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/admin';
import type { CreateDealerInput, UpdateDealerInput, ListUsersQuery } from '@/lib/api/admin';

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  dealers: () => [...adminKeys.all, 'dealers'] as const,
  dealer: (id: string) => [...adminKeys.dealers(), id] as const,
  users: (query: ListUsersQuery) => [...adminKeys.all, 'users', query] as const,
};

// Get all dealers
export const useDealers = () => {
  return useQuery({
    queryKey: adminKeys.dealers(),
    queryFn: adminApi.getDealers,
  });
};

// Get single dealer
export const useDealer = (id: string) => {
  return useQuery({
    queryKey: adminKeys.dealer(id),
    queryFn: () => adminApi.getDealer(id),
    enabled: !!id,
  });
};

// List users with filters
export const useUsers = (query: ListUsersQuery) => {
  return useQuery({
    queryKey: adminKeys.users(query),
    queryFn: () => adminApi.listUsers(query),
  });
};

// Create dealer mutation
export const useCreateDealer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDealerInput) => adminApi.createDealer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.dealers() });
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// Update dealer mutation
export const useUpdateDealer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealerInput }) => 
      adminApi.updateDealer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.dealer(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.dealers() });
    },
  });
};

// Suspend dealer mutation
export const useSuspendDealer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      adminApi.suspendDealer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.dealers() });
    },
  });
};

// Reactivate dealer mutation
export const useReactivateDealer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.reactivateDealer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.dealers() });
    },
  });
};

// Reset dealer password mutation
export const useResetDealerPassword = () => {
  return useMutation({
    mutationFn: (id: string) => adminApi.resetDealerPassword(id),
  });
};

// Dashboard query key
export const adminDashboardKey = ['admin', 'dashboard'] as const;
export const adminUserKey = (id: string) => ['admin', 'user', id] as const;

// Get admin dashboard
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: adminDashboardKey,
    queryFn: adminApi.getAdminDashboard,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Get user details
export const useUserDetails = (id: string) => {
  return useQuery({
    queryKey: adminUserKey(id),
    queryFn: () => adminApi.getUserDetails(id),
    enabled: !!id,
  });
};

// Suspend user mutation
export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      adminApi.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// Reactivate user mutation
export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// Create user wallets mutation
export const useCreateUserWallets = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminApi.createUserWallets(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminUserKey(id) });
    },
  });
};


// Audit logs query key
export const auditLogsKey = (query: adminApi.AuditLogsQuery) => ['admin', 'audit', query] as const;

// Get audit logs
export const useAuditLogs = (query: adminApi.AuditLogsQuery) => {
  return useQuery({
    queryKey: auditLogsKey(query),
    queryFn: () => adminApi.getAuditLogs(query),
  });
};
