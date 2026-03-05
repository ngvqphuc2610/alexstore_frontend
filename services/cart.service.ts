import api from './api';
import type { Cart, AddCartItemRequest, UpdateCartItemRequest } from '@/types';

export const cartService = {
    getCart: async (): Promise<Cart> => {
        return api.get('/cart');
    },

    addItem: async (data: AddCartItemRequest): Promise<any> => {
        return api.post('/cart/items', data);
    },

    updateItem: async (itemId: number, data: UpdateCartItemRequest): Promise<any> => {
        return api.put(`/cart/items/${itemId}`, data);
    },

    removeItem: async (itemId: number): Promise<any> => {
        return api.delete(`/cart/items/${itemId}`);
    },
};
