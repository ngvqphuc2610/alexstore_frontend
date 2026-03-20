export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
    id: number;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    product?: {
        id: string;
        name: string;
        sellerId: string;
        images?: { imageUrl: string; isPrimary: boolean }[];
        seller?: { username: string };
    };
}

export interface Order {
    id: string;
    orderCode: string;
    buyerId: string;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: string | null;
    paymentStatus: PaymentStatus;
    paymentTransactionId: string | null;
    paidAt: string | null;
    shippingAddress: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    buyer?: { id: string; username: string; email: string };
    orderItems?: OrderItem[];
}

export interface OrderFilters {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
}

export interface UpdateOrderRequest {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
}
