export interface CartProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
}

export interface CartProduct {
    id: string;
    name: string;
    price: number;
    images?: CartProductImage[];
}

export interface CartItem {
    id: number;
    quantity: number;
    product: CartProduct;
}

export interface Cart {
    id: string;
    items: CartItem[];
}

export interface AddCartItemRequest {
    productId: string;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}
