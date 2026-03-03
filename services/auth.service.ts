import type { RegisterRequest } from '@/types';

export const authService = {
    register: async (data: RegisterRequest) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Registration failed');
        }

        return res.json();
    },
};
