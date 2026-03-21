export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

export interface ProductImage {
    id: number;
    productId: string;
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface Product {
    id: string;
    sellerId: string;
    categoryId: number;
    name: string;
    description: string | null;
    price: number | string;
    originalPrice?: number | string | null;
    stockQuantity: number;
    avgRating: number;
    reviewCount: number;
    status: ProductStatus;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    seller?: {
        id: string;
        username: string;
        createdAt?: string;
        totalProducts?: number;
        sellerProfile?: {
            shopName: string;
            sellerType: string;
            verificationStatus: string;
            shopRating: number;
        };
    };
    category?: { id: number; name: string };
    images?: ProductImage[];
}

export interface CreateProductRequest {
    name: string;
    description?: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    status?: ProductStatus;
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProductStatus | 'all';
    categoryId?: number;
    sellerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
