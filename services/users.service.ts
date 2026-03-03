import api from './api';
import type { User, UpdateUserRequest, PaginatedResponse } from '@/types';

export const usersService = {
    getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<User>> => {
        return api.get('/users', { params });
    },

    getById: async (id: string): Promise<User> => {
        return api.get(`/users/${id}`);
    },

    update: async (id: string, data: UpdateUserRequest): Promise<User> => {
        return api.patch(`/users/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete(`/users/${id}`);
    },
};
