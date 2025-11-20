'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const store = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Initialize auth from localStorage on mount
    store.initializeAuth();
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    isReady: isHydrated,
  };
}
