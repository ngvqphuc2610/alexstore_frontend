import api from './api';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types';

export const categoriesService = {
    getAll: async (): Promise<Category[]> => {
        return api.get('/categories');
    },

    getById: async (id: number): Promise<Category> => {
        return api.get(`/categories/${id}`);
    },

    create: async (data: CreateCategoryRequest): Promise<Category> => {
        return api.post('/categories', data);
    },

    update: async (id: number, data: UpdateCategoryRequest): Promise<Category> => {
        return api.patch(`/categories/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        return api.delete(`/categories/${id}`);
    },
};
