import api from './api';
import type { Review, ReviewFilters, PaginatedResponse } from '@/types';

export const reviewsService = {
    getAll: async (params?: ReviewFilters): Promise<PaginatedResponse<Review>> => {
        return api.get('/reviews', { params });
    },

    delete: async (id: number): Promise<void> => {
        return api.delete(`/reviews/${id}`);
    },
};
