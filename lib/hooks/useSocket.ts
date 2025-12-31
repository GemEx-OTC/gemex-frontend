'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { 
  initSocket, 
  getSocket, 
  disconnectSocket,
  joinMemoRoom,
  leaveMemoRoom,
  sendTypingIndicator,
  type MemoReplyEvent,
  type MemoStatusEvent,
  type MemoAssignedEvent,
  type MemoTypingEvent,
  type NewMemoEvent,
} from '@/lib/socket';
import { getTokens } from '@/lib/api/client';
import { useSocketContext } from '@/lib/providers/socket-provider';

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Hook for managing socket connection
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const { accessToken } = getTokens();
    if (!accessToken) return;

    const socketInstance = initSocket();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      // Don't disconnect on unmount to maintain connection across pages
    };
  }, [autoConnect, connect]);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}

interface UseMemoSocketOptions {
  memoId: string | null;
  onNewReply?: (event: MemoReplyEvent) => void;
  onStatusUpdate?: (event: MemoStatusEvent) => void;
  onAssigned?: (event: MemoAssignedEvent) => void;
  onUserTyping?: (event: MemoTypingEvent) => void;
}

interface UseMemoSocketReturn {
  isConnected: boolean;
  typingUsers: string[];
  sendTyping: (isTyping: boolean) => void;
}

/**
 * Hook for memo-specific socket events
 */
export function useMemoSocket(options: UseMemoSocketOptions): UseMemoSocketReturn {
  const { memoId, onNewReply, onStatusUpdate, onAssigned, onUserTyping } = options;
  const { socket, isConnected: contextConnected } = useSocketContext();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!socket || !memoId) {
      setIsConnected(false);
      return;
    }

    // Join memo room
    socket.emit('memo:join', memoId);
    setIsConnected(socket.connected);

    // Handle connection status
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // Handle memo events
    const handleNewReply = (event: MemoReplyEvent) => {
      if (event.memoId === memoId) {
        onNewReply?.(event);
      }
    };

    const handleStatusUpdate = (event: MemoStatusEvent) => {
      if (event.memoId === memoId) {
        onStatusUpdate?.(event);
      }
    };

    const handleAssigned = (event: MemoAssignedEvent) => {
      if (event.memoId === memoId) {
        onAssigned?.(event);
      }
    };

    const handleUserTyping = (event: MemoTypingEvent) => {
      if (event.memoId === memoId) {
        onUserTyping?.(event);
        
        // Manage typing users list
        if (event.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(event.userId)) {
              return [...prev, event.userId];
            }
            return prev;
          });

          // Clear existing timeout for this user
          const existingTimeout = typingTimeoutRef.current.get(event.userId);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }

          // Set timeout to remove user from typing list
          const timeout = setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== event.userId));
            typingTimeoutRef.current.delete(event.userId);
          }, 3000);
          typingTimeoutRef.current.set(event.userId, timeout);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== event.userId));
          const existingTimeout = typingTimeoutRef.current.get(event.userId);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
            typingTimeoutRef.current.delete(event.userId);
          }
        }
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('memo:new_reply', handleNewReply);
    socket.on('memo:status_updated', handleStatusUpdate);
    socket.on('memo:assigned', handleAssigned);
    socket.on('memo:user_typing', handleUserTyping);

    return () => {
      // Leave memo room
      socket.emit('memo:leave', memoId);

      // Remove listeners
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('memo:new_reply', handleNewReply);
      socket.off('memo:status_updated', handleStatusUpdate);
      socket.off('memo:assigned', handleAssigned);
      socket.off('memo:user_typing', handleUserTyping);

      // Clear all typing timeouts
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, [socket, memoId, onNewReply, onStatusUpdate, onAssigned, onUserTyping]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (memoId && socket?.connected) {
      socket.emit('memo:typing', { memoId, isTyping });
    }
  }, [memoId, socket]);

  return {
    isConnected: isConnected && contextConnected,
    typingUsers,
    sendTyping,
  };
}

interface UseMemosSocketOptions {
  onNewMemo?: (event: NewMemoEvent) => void;
  onMemoUpdate?: (memo: any) => void;
}

/**
 * Hook for global memo list socket events
 */
export function useMemosSocket(options: UseMemosSocketOptions = {}) {
  const { onNewMemo, onMemoUpdate } = options;
  const { socket, isConnected: contextConnected } = useSocketContext();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleNewMemo = (event: NewMemoEvent) => {
      onNewMemo?.(event);
    };

    const handleMemoUpdate = (event: { memo: any }) => {
      onMemoUpdate?.(event.memo);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('memo:new', handleNewMemo);
    socket.on('memo:updated', handleMemoUpdate);
    socket.on('memo:new_reply', handleMemoUpdate);
    socket.on('memo:status_updated', handleMemoUpdate);
    socket.on('memo:assigned', handleMemoUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('memo:new', handleNewMemo);
      socket.off('memo:updated', handleMemoUpdate);
      socket.off('memo:new_reply', handleMemoUpdate);
      socket.off('memo:status_updated', handleMemoUpdate);
      socket.off('memo:assigned', handleMemoUpdate);
    };
  }, [socket, onNewMemo, onMemoUpdate]);

  return { isConnected: isConnected && contextConnected };
}

export default useSocket;
