'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket, getSocket, reconnectSocket } from '@/lib/socket';
import { useAuth } from './auth-provider';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  reconnect: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if user is authenticated and is a dealer or admin
    if (isAuthenticated && user && ['dealer', 'admin'].includes(user.role)) {
      const socketInstance = initSocket();
      setSocket(socketInstance);

      const handleConnect = () => {
        setIsConnected(true);
        console.log('Socket connected for real-time updates');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      };

      const handleError = (error: Error) => {
        console.error('Socket error:', error.message);
      };

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('connect_error', handleError);

      // Set initial state
      setIsConnected(socketInstance.connected);

      return () => {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('connect_error', handleError);
      };
    } else {
      // Disconnect if user logs out or is not dealer/admin
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [isAuthenticated, user]);

  const reconnect = () => {
    const newSocket = reconnectSocket();
    setSocket(newSocket);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => useContext(SocketContext);

export default SocketProvider;
