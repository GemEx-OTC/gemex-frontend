'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/auth-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'admin' | 'dealer')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
      // Redirect to appropriate dashboard based on user's actual role
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
      router.replace(redirectPath);
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if role not allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    return null;
  }

  return <>{children}</>;
}
