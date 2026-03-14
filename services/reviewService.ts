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
    ) {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', String(limit));
        if (search) params.set('search', search);
        if (sortBy) params.set('sortBy', sortBy);

        const res = await fetch(`/api/proxy/reviews?${params.toString()}`);
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể lấy danh sách đánh giá');
        }
        return res.json();
    },

    /** Delete a review (Admin) */
    async deleteReview(id: number): Promise<void> {
        const res = await fetch(`/api/proxy/reviews/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Không thể xóa đánh giá');
        }
    },
};
