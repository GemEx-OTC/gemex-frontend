import { io, Socket } from 'socket.io-client';
import { getTokens } from './api/client';

const SOCKET_URL = process.env.NEXT_PUBLIC_GEMOTC_API_BASE_URL || 'http://localhost:4000';

let socket: Socket | null = null;

/**
 * Initialize socket connection
 */
export const initSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const { accessToken } = getTokens();

  socket = io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Reconnect socket with new token
 */
export const reconnectSocket = () => {
  disconnectSocket();
  return initSocket();
};

/**
 * Join a memo room for real-time updates
 */
export const joinMemoRoom = (memoId: string) => {
  if (socket?.connected) {
    socket.emit('memo:join', memoId);
  }
};

/**
 * Leave a memo room
 */
export const leaveMemoRoom = (memoId: string) => {
  if (socket?.connected) {
    socket.emit('memo:leave', memoId);
  }
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (memoId: string, isTyping: boolean) => {
  if (socket?.connected) {
    socket.emit('memo:typing', { memoId, isTyping });
  }
};

// Socket event types
export interface MemoReplyEvent {
  memoId: string;
  reply: any;
  memo: any;
}

export interface MemoStatusEvent {
  memoId: string;
  status: string;
  memo: any;
}

export interface MemoAssignedEvent {
  memoId: string;
  assignee: any;
  memo: any;
}

export interface MemoTypingEvent {
  memoId: string;
  userId: string;
  isTyping: boolean;
}

export interface NewMemoEvent {
  memo: any;
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  reconnectSocket,
  joinMemoRoom,
  leaveMemoRoom,
  sendTypingIndicator,
};
