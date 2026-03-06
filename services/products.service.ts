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
        return api.put(`/products/${id}`, data);
    },

    updateStatus: async (id: string, data: { status: string }): Promise<Product> => {
        return api.patch(`/products/${id}/status`, data);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete(`/products/${id}`);
    },

    uploadImage: async (id: string, formData: FormData): Promise<any> => {
        // Axios will automatically set the correct Content-Type with boundary for FormData
        return api.post(`/products/${id}/images`, formData);
    },

    deleteImage: async (productId: string, imageId: number): Promise<any> => {
        return api.delete(`/products/${productId}/images/${imageId}`);
    },

    addImageUrl: async (productId: string, imageUrl: string): Promise<any> => {
        return api.post(`/products/${productId}/images/url`, { imageUrl });
    },

    setPrimaryImage: async (productId: string, imageId: number): Promise<any> => {
        return api.patch(`/products/${productId}/images/${imageId}/primary`);
    },
};
