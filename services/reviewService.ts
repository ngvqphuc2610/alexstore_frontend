import api from './api';

/**
 * Service for admin review management
 */
export const reviewService = {
    /** List all reviews (Admin) */
    async getAllReviews(
        page = 1,
        limit = 20,
        search?: string,
        sortBy?: string,
    ): Promise<any> {
        return api.get('/reviews', {
            params: { page, limit, search, sortBy }
        });
    },

    /** Delete a review (Admin) */
    async deleteReview(id: number): Promise<void> {
        return api.delete(`/reviews/${id}`);
    },
};
