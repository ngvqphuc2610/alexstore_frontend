export interface Review {
    id: number;
    productId: string;
    buyerId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    product?: { id: string; name: string };
    buyer?: { id: string; username: string };
}

export interface CreateReviewRequest {
    productId: string;
    rating: number;
    comment?: string;
}

export interface ReviewFilters {
    page?: number;
    limit?: number;
    productId?: string;
}
