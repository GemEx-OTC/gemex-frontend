import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletsApi from '@/lib/api/wallets';

export const walletKeys = {
  all: ['wallets'] as const,
  myWallets: () => [...walletKeys.all, 'my-wallets'] as const,
  networks: () => [...walletKeys.all, 'networks'] as const,
};

// Get user's wallets (auto-creates if needed)
export const useMyWallets = () => {
  return useQuery({
    queryKey: walletKeys.myWallets(),
    queryFn: walletsApi.getMyWallets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get network info
export const useNetworksInfo = () => {
  return useQuery({
    queryKey: walletKeys.networks(),
    queryFn: walletsApi.getNetworksInfo,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Create wallets mutation
export const useCreateWallets = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: walletsApi.createWallets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.myWallets() });
    },
  });
};
