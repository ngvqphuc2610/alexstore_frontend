import api from './api';
import type { Order, OrderStatus } from '@/types';

export interface PlaceOrderRequest {
    addressId: string;
    paymentMethod: string;
    items: { productId: string; quantity: number }[];
}

export const ordersService = {
    // ─── Admin APIs ──────────────────────────────────────────────────────
    getAll: async (params?: any): Promise<any> => {
        return api.get('/orders/admin/all', { params });
    },

    // ─── Buyer APIs ──────────────────────────────────────────────────────
    placeOrder: async (data: PlaceOrderRequest): Promise<Order> => {
        return api.post('/orders', data);
    },

    getMyOrders: async (params?: any): Promise<any> => {
        return api.get('/orders', { params });
    },

    getById: async (id: string): Promise<Order> => {
        return api.get(`/orders/${id}`);
    },

    cancelOrder: async (id: string): Promise<any> => {
        return api.patch(`/orders/${id}/cancel`);
    },

    // ─── Seller APIs ─────────────────────────────────────────────────────
    getSellerOrders: async (): Promise<Order[]> => {
        return api.get('/orders/seller/all');
    },

    updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
        return api.patch(`/orders/${id}/status`, { status });
    },

    getSellerAnalytics: async (range: string = '30d'): Promise<any> => {
        return api.get(`/orders/seller/analytics?range=${range}`);
    },
};
