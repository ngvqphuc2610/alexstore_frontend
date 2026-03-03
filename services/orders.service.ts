import api from './api';
import type { Order, OrderFilters, UpdateOrderRequest, PaginatedResponse } from '@/types';

export const ordersService = {
    getAll: async (params?: OrderFilters): Promise<PaginatedResponse<Order>> => {
        return api.get('/orders', { params });
    },

    getById: async (id: string): Promise<Order> => {
        return api.get(`/orders/${id}`);
    },

    update: async (id: string, data: UpdateOrderRequest): Promise<Order> => {
        return api.patch(`/orders/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete(`/orders/${id}`);
    },
};
