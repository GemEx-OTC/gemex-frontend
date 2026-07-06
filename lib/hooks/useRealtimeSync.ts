'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from '@/lib/providers/socket-provider';
import { quotesKeys } from './use-quotes';
import { tradesKeys } from './use-trades';

/**
 * Hook to automatically synchronize quotes and trades cache
 * with real-time updates from WebSocket server.
 */
export function useRealtimeSync() {
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // Listen for new quotes
    const handleNewQuote = () => {
      console.log('Real-time sync: Invaliding quote queries due to new quote');
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    };

    // Listen for quote updates
    const handleQuoteUpdated = (data: { quoteId: string }) => {
      console.log(`Real-time sync: Invaliding quote queries due to quote update: ${data.quoteId}`);
      queryClient.invalidateQueries({ queryKey: quotesKeys.all });
    };

    // Listen for trade updates
    const handleTradeUpdated = (data: { tradeId: string }) => {
      console.log(`Real-time sync: Invaliding trade queries due to trade update: ${data.tradeId}`);
      queryClient.invalidateQueries({ queryKey: tradesKeys.all });
    };

    socket.on('quote:new', handleNewQuote);
    socket.on('quote:updated', handleQuoteUpdated);
    socket.on('trade:updated', handleTradeUpdated);

    return () => {
      socket.off('quote:new', handleNewQuote);
      socket.off('quote:updated', handleQuoteUpdated);
      socket.off('trade:updated', handleTradeUpdated);
    };
  }, [socket, queryClient]);
}
