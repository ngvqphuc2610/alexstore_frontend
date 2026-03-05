import { create } from 'zustand';
import type { User } from '@/types';

// Role → dashboard mapping (same as middleware)
const ROLE_DASHBOARDS: Record<string, string> = {
    ADMIN: '/admin/dashboard',
    SELLER: '/seller/dashboard',
    BUYER: '/',
};

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;

    /** Set user in memory after auth check */
    setUser: (user: User) => void;

    /** Clear user from memory */
    clearUser: () => void;

    /** Check auth status via /api/auth/me (reads HttpOnly cookie) */
    checkAuth: () => Promise<void>;

    /** Login → sets HttpOnly cookie + role cookie, stores user, returns redirect URL */
    login: (email: string, password: string) => Promise<string>;

    /** Logout → clears cookies, clears user */
    logout: () => Promise<void>;

    /** Register → calls backend, optionally returns redirect URL or user data */
    register: (data: any) => Promise<void>;

    /** Get the dashboard URL for the current user's role */
    getDashboardUrl: () => string;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,

    setUser: (user: User) =>
        set({ user, isAuthenticated: true, isLoading: false, isInitialized: true }),

    clearUser: () =>
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true }),

    checkAuth: async () => {
        const { isInitialized, isAuthenticated, user } = get();
        if (isInitialized || (isAuthenticated && user)) {
            set({ isLoading: false });
            return;
        }

        try {
            set({ isLoading: true });
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                set({ user: data.user, isAuthenticated: true, isLoading: false, isInitialized: true });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
            }
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        }
    },

    login: async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Đăng nhập thất bại');
        }

        const data = await res.json();
        const user = data.user;
        set({ user, isAuthenticated: true, isLoading: false, isInitialized: true });

        // Return the dashboard URL for the user's role
        return ROLE_DASHBOARDS[user.role] || '/';
    },

    logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    },

    register: async (data: any) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Đăng ký thất bại');
        }

        const result = await res.json();
        // Optionally auto-login if backend returns user/token
        if (result.user) {
            set({ user: result.user, isAuthenticated: true, isLoading: false, isInitialized: true });
        }
    },

    getDashboardUrl: () => {
        const { user } = get();
        return ROLE_DASHBOARDS[user?.role || 'BUYER'] || '/';
    },
}));
