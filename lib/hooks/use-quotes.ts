'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as quotesApi from '@/lib/api/quotes';
import type { GetQuotesParams, CreateQuoteInput, GenerateQuoteInput, RejectQuoteInput } from '@/lib/api/quotes';

// Query keys
export const quotesKeys = {
  all: ['quotes'] as const,
  lists: () => [...quotesKeys.all, 'list'] as const,
  list: (params: GetQuotesParams) => [...quotesKeys.lists(), params] as const,
  details: () => [...quotesKeys.all, 'detail'] as const,
  detail: (id: string) => [...quotesKeys.details(), id] as const,
};

// Hook to get quotes list
export const useQuotes = (params: GetQuotesParams = {}) => {
  return useQuery({
    queryKey: quotesKeys.list(params),
    queryFn: () => quotesApi.getQuotes(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get quote by ID
export const useQuoteById = (quoteId: string) => {
  return useQuery({
    queryKey: quotesKeys.detail(quoteId),
    queryFn: () => quotesApi.getQuoteById(quoteId),
    enabled: !!quoteId,
  });
};

// Hook to create a quote request (Client)
export const useCreateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuoteInput) => quotesApi.createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
  });
};

// Hook to generate firm quote (Dealer)
export const useGenerateFirmQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data: GenerateQuoteInput }) => 
      quotesApi.generateFirmQuote(quoteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
  });
};

// Hook to accept quote (Client)
export const useAcceptQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => quotesApi.acceptQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
  });
};

// Hook to reject quote (Dealer)
export const useRejectQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data?: RejectQuoteInput }) => 
      quotesApi.rejectQuote(quoteId, data || {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
  });
};

// Hook to cancel quote (Client)
export const useCancelQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quoteId: string) => quotesApi.cancelQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    },
  });
};
