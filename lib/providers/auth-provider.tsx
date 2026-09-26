'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@/lib/hooks/use-auth';
import { getTokens, hasSession } from '@/lib/api/client';
import type { User } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

// Routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/reset-password',
  '/auth/set-password',
  '/demo',
  '/',
];

// Routes that authenticated users shouldn't access
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken } = getTokens();
  const sessionActive = hasSession() || !!accessToken;
  const { data: user, isLoading: isProfileLoading, isError } = useProfile();
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthenticated = !!user && !isError;
  const isLoading = !isInitialized || (sessionActive && isProfileLoading);

  useEffect(() => {
    // Mark as initialized after first render
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || (sessionActive && isProfileLoading)) return;

    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

    // If user is authenticated and trying to access auth routes, redirect to dashboard
    if (isAuthenticated && isAuthRoute) {
      const redirectPath = user?.role === 'admin' 
        ? '/admin/dashboard' 
        : user?.role === 'dealer' 
          ? '/dealer/dashboard' 
          : '/client/dashboard';
      router.replace(redirectPath);
      return;
    }

    // If user is not authenticated and trying to access protected routes
    if (!sessionActive && !isPublicRoute) {
      router.replace('/auth/login');
      return;
    }

    // If session was active but profile fetch failed (invalid/expired session), redirect to login
    if (sessionActive && isError && !isPublicRoute) {
      router.replace('/auth/login');
      return;
    }
  }, [isInitialized, isAuthenticated, isProfileLoading, pathname, router, user, sessionActive, isError]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
