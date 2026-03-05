import type { User, Role } from '@/types';

export interface CreateUserData {
    username: string;
    email: string;
    password?: string;
    role: Role;
    shopName?: string;
}

export interface UpdateUserData {
    username?: string;
    email?: string;
    role?: Role;
}

/**
 * Service for administrative user management
 */
export const userService = {
    /** List all users */
    async getAllUsers(): Promise<User[]> {
        const res = await fetch('/api/proxy/users');
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể lấy danh sách người dùng');
        }
        const data = await res.json();
        return data.data ?? data;
    },

    /** Create a new user */
    async createUser(data: CreateUserData): Promise<User> {
        const res = await fetch('/api/proxy/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể tạo người dùng');
        }
        const result = await res.json();
        return result.data ?? result;
    },

    /** Update a user by ID */
    async updateUser(id: string, data: UpdateUserData): Promise<User> {
        const res = await fetch(`/api/proxy/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể cập nhật người dùng');
        }
        const result = await res.json();
        return result.data ?? result;
    },

    /** Delete (deactivate) a user by ID */
    async deleteUser(id: string): Promise<void> {
        const res = await fetch(`/api/proxy/users/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể xóa người dùng');
        }
    }
};
