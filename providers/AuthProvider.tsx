'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * AuthProvider: checks auth state on mount by calling /api/auth/me.
 * Wrap this around layouts that need auth.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const { checkAuth, isInitialized, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isInitialized && !isLoading) {
            checkAuth();
        }
    }, [checkAuth, isInitialized, isLoading]);
    

    return <>{children}</>;
}
