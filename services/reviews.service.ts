import api from './api';

export interface CreateReviewRequest {
    productId: string;
    rating: number;
    comment?: string;
}

export interface ReviewResponse {
    id: number;
    productId: string;
    buyerId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    buyer?: string;
}

export const reviewsService = {
    getByProduct: async (productId: string, page = 1, limit = 20): Promise<any> => {
        return api.get('/reviews', { params: { productId, page, limit } });
    },

    submitReview: async (data: CreateReviewRequest): Promise<ReviewResponse> => {
        return api.post('/reviews', data);
    },
};
