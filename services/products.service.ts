import api from './api';
import type {
    Product,
    CreateProductRequest,
    UpdateProductRequest,
    ProductFilters,
    PaginatedResponse,
} from '@/types';

export const productsService = {
    getAll: async (params?: ProductFilters): Promise<PaginatedResponse<Product>> => {
        return api.get('/products', { params });
    },

    getById: async (id: string): Promise<Product> => {
        return api.get(`/products/${id}`);
    },

    create: async (data: CreateProductRequest): Promise<Product> => {
        return api.post('/products', data);
    },

    update: async (id: string, data: UpdateProductRequest): Promise<Product> => {
        return api.patch(`/products/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete(`/products/${id}`);
    },
};
