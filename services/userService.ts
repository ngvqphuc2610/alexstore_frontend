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
    },

    /** Ban a user */
    async banUser(id: string): Promise<void> {
        const res = await fetch(`/api/proxy/users/${id}/ban`, {
            method: 'PATCH',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể khóa người dùng');
        }
    },

    /** Unban a user */
    async unbanUser(id: string): Promise<void> {
        const res = await fetch(`/api/proxy/users/${id}/unban`, {
            method: 'PATCH',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể mở khóa người dùng');
        }
    },

    /** Approve a seller */
    async approveSeller(id: string): Promise<void> {
        const res = await fetch(`/api/proxy/users/${id}/approve-seller`, {
            method: 'PATCH',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể duyệt người bán');
        }
    },

    /** Reject a seller */
    async rejectSeller(id: string): Promise<void> {
        const res = await fetch(`/api/proxy/users/${id}/reject-seller`, {
            method: 'PATCH',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể từ chối người bán');
        }
    },

    /** Register as a seller (buyer submits application) */
    async registerSeller(data: { shopName: string; taxCode?: string; pickupAddress?: string }): Promise<any> {
        const res = await fetch('/api/proxy/users/seller/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể đăng ký người bán');
        }
        return res.json();
    },

    /** Get pending seller requests (Admin) */
    async getPendingSellers(page = 1, limit = 20) {
        const res = await fetch(`/api/proxy/users/pending-sellers?page=${page}&limit=${limit}`);
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể lấy danh sách yêu cầu');
        }
        return res.json();
    },
};
