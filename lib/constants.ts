import type { Role, ProductStatus, OrderStatus, PaymentStatus } from '@/types';

// Role labels & colors
export const ROLE_CONFIG: Record<Role, { label: string; color: string }> = {
    BUYER: { label: 'Người mua', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    SELLER: { label: 'Người bán', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' },
    ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

// Product status labels & colors
export const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { label: string; color: string }> = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    HIDDEN: { label: 'Ẩn', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
};

// Order status labels & colors
export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
    PENDING: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    PAID: { label: 'Thành công', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
    SHIPPING: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

// Payment status labels & colors
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    PAID: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    REFUNDED: { label: 'Hoàn tiền', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
};

// Currency formatter
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Date formatter
export const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
};

// Short date
export const formatShortDate = (dateString: string): string => {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(dateString));
};
