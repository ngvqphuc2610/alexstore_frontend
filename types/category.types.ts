export interface Category {
    id: number;
    name: string;
    parentId: number | null;
    parent?: Category;
    children?: Category[];
    _count?: { products: number };
    allowedSellerTypes?: { sellerType: string }[];
}

export interface CreateCategoryRequest {
    name: string;
    parentId?: number | null;
    allowedSellerTypes?: string[];
}

export interface UpdateCategoryRequest {
    name?: string;
    parentId?: number | null;
    allowedSellerTypes?: string[];
}
