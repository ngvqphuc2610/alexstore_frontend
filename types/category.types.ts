export interface Category {
    id: number;
    name: string;
    parentId: number | null;
    parent?: Category;
    children?: Category[];
    _count?: { products: number };
}

export interface CreateCategoryRequest {
    name: string;
    parentId?: number | null;
}

export interface UpdateCategoryRequest {
    name?: string;
    parentId?: number | null;
}
