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

    /** Get the dashboard URL for the current user's role */
    getDashboardUrl: () => string;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user: User) =>
        set({ user, isAuthenticated: true, isLoading: false }),

    clearUser: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

    checkAuth: async () => {
        try {
            set({ isLoading: true });
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                set({ user: data.user, isAuthenticated: true, isLoading: false });
            } else {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
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
        set({ user, isAuthenticated: true, isLoading: false });

        // Return the dashboard URL for the user's role
        return ROLE_DASHBOARDS[user.role] || '/';
    },

    logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    getDashboardUrl: () => {
        const { user } = get();
        return ROLE_DASHBOARDS[user?.role || 'BUYER'] || '/';
    },
}));
