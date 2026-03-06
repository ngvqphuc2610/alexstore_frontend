'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Package,
    MapPin,
    CreditCard,
    Calendar,
    Hash,
    User,
    ShoppingBag,
} from 'lucide-react';
import type { Order } from '@/types';

interface OrderDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: Order | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    PAID: { label: 'Đã thanh toán', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    SHIPPING: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    DELIVERED: { label: 'Đã giao hàng', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    UNPAID: { label: 'Chưa thanh toán', color: 'bg-gray-100 text-gray-700' },
    PAID: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700' },
    FAILED: { label: 'Thất bại', color: 'bg-red-100 text-red-700' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-orange-100 text-orange-700' },
};

export function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
    if (!order) return null;

    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID;

    const sellerTotal = order.orderItems?.reduce(
        (sum, item) => sum + item.priceAtPurchase * item.quantity,
        0
    ) ?? 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <ShoppingBag className="h-5 w-5 text-emerald-600" />
                        Chi tiết đơn hàng
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin đầy đủ về đơn hàng #{order.orderCode}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-2">
                    {/* ─── Order Header Info ──────────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoRow icon={Hash} label="Mã đơn hàng" value={order.orderCode} bold />
                        <InfoRow
                            icon={Calendar}
                            label="Ngày đặt"
                            value={new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        />
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5" /> Trạng thái đơn
                            </p>
                            <Badge className={`${statusCfg.color} border text-xs`}>
                                {statusCfg.label}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                <CreditCard className="h-3.5 w-3.5" /> Thanh toán
                            </p>
                            <div className="flex items-center gap-2">
                                <Badge className={`${paymentCfg.color} text-xs`}>
                                    {paymentCfg.label}
                                </Badge>
                                {order.paymentMethod && (
                                    <span className="text-xs text-gray-400">
                                        ({order.paymentMethod})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* ─── Shipping Address ───────────────────────────────────────── */}
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100">
                        <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4" />
                            Địa chỉ giao hàng
                        </h4>
                        <p className="text-sm text-emerald-700 leading-relaxed">
                            {order.shippingAddress}
                        </p>
                    </div>

                    {/* ─── Order Items ────────────────────────────────────────────── */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4 text-emerald-600" />
                            Sản phẩm ({order.orderItems?.length || 0})
                        </h4>
                        <div className="space-y-2">
                            {order.orderItems?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.product?.name || `Sản phẩm #${item.productId.substring(0, 8)}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Đơn giá: {item.priceAtPurchase.toLocaleString('vi-VN')}₫ × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-emerald-700 ml-4 whitespace-nowrap">
                                        {(item.priceAtPurchase * item.quantity).toLocaleString('vi-VN')}₫
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* ─── Total ──────────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-900 text-white">
                        <span className="text-sm font-medium">Tổng tiền (sản phẩm của bạn)</span>
                        <span className="text-xl font-bold">
                            {sellerTotal.toLocaleString('vi-VN')}₫
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Helper Component ────────────────────────────────────────────────────────
function InfoRow({
    icon: Icon,
    label,
    value,
    bold,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    bold?: boolean;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" /> {label}
            </p>
            <p className={`text-sm ${bold ? 'font-bold text-emerald-800' : 'text-gray-900'}`}>
                {value}
            </p>
        </div>
    );
}
