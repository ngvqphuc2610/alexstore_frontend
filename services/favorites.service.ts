import api from './api';
import { Product } from '@/types';

export interface FavoriteItem {
    id: number;
    productId: string;
    createdAt: string;
    product: Product;
}

export const favoritesService = {
    getFavorites: async (): Promise<FavoriteItem[]> => {
        return api.get('/favorites') as any;
    },

    addFavorite: async (productId: string): Promise<{ message: string, id: number }> => {
        return api.post('/favorites', { productId }) as any;
    },

    removeFavorite: async (productId: string): Promise<{ message: string }> => {
        return api.delete(`/favorites/${productId}`) as any;
    }
};
