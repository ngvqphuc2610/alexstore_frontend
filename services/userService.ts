import type { User, Role } from '@/types';
import api from './api';

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
        const response = await api.get('/users');
        return response.data;
    },

    /** Create a new user */
    async createUser(data: CreateUserData): Promise<User> {
        const response = await api.post('/users', data);
        return response.data;
    },

    /** Update a user by ID */
    async updateUser(id: string, data: UpdateUserData): Promise<User> {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    /** Delete (deactivate) a user by ID */
    async deleteUser(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    },

    /** Ban a user */
    async banUser(id: string): Promise<void> {
        await api.patch(`/users/${id}/ban`);
    },

    /** Unban a user */
    async unbanUser(id: string): Promise<void> {
        await api.patch(`/users/${id}/unban`);
    },

    /** Approve a seller */
    async approveSeller(id: string): Promise<void> {
        await api.patch(`/users/${id}/approve-seller`);
    },

    /** Reject a seller */
    async rejectSeller(id: string): Promise<void> {
        await api.patch(`/users/${id}/reject-seller`);
    },

    /** Register as a seller (buyer submits application) */
    async registerSeller(data: { shopName: string; taxCode?: string; pickupAddress?: string }): Promise<any> {
        const response = await api.post('/users/seller/register', data);
        return response.data;
    },

    /** Get pending seller requests (Admin) */
    async getPendingSellers(page = 1, limit = 20) {
        return api.get(`/users/pending-sellers?page=${page}&limit=${limit}`);
    },
};
