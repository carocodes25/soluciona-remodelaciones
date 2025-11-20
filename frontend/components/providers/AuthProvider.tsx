'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/lib/stores/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initializeAuth = useAuthStore((state: any) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
