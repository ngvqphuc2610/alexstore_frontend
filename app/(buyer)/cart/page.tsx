'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ShoppingBag, Trash2, Plus, Minus, ArrowRight,
    ShieldCheck, Truck, RotateCcw, Tag, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { toast } from 'sonner';
import type { CartItem } from '@/types';

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `/api/proxy${url}`;
};

export default function CartPage() {
    const queryClient = useQueryClient();

    const { data: cart, isLoading, isError } = useQuery({
        queryKey: ['cart'],
        queryFn: cartService.getCart,
    });

    const updateMutation = useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
            cartService.updateItem(itemId, { quantity }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật'),
    });

    const removeMutation = useMutation({
        mutationFn: (itemId: number) => cartService.removeItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa'),
    });

    const items: CartItem[] = cart?.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const handleQuantityChange = (item: CartItem, delta: number) => {
        const newQty = item.quantity + delta;
        if (newQty < 1) return;
        updateMutation.mutate({ itemId: item.id, quantity: newQty });
    };

    const handleRemove = (item: CartItem) => {
        removeMutation.mutate(item.id);
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Giỏ hàng</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
                    Giỏ hàng của bạn
                    {items.length > 0 && (
                        <span className="text-lg font-normal text-gray-500 ml-2">({items.length} sản phẩm)</span>
                    )}
                </h1>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : isError ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể tải giỏ hàng</h2>
                        <p className="text-gray-500 mb-6">Vui lòng đăng nhập để xem giỏ hàng của bạn.</p>
                        <Button asChild>
                            <Link href="/login">Đăng nhập</Link>
                        </Button>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="h-20 w-20 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
                        <Button asChild>
                            <Link href="/products">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Mua sắm ngay
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Cart Items */}
                        <div className="flex-1 space-y-4">
                            {items.map((item) => {
                                const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
                                return (
                                    <Card key={item.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex gap-4 sm:gap-6">
                                                {/* Product Image */}
                                                <Link href={`/products/${item.product.id}`} className="shrink-0">
                                                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                                        {primaryImage ? (
                                                            <img
                                                                src={getImageUrl(primaryImage.imageUrl)}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ShoppingBag className="h-8 w-8 text-gray-300" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/products/${item.product.id}`}
                                                        className="font-semibold text-gray-900 hover:text-primary line-clamp-2 transition-colors"
                                                    >
                                                        {item.product.name}
                                                    </Link>

                                                    <div className="mt-2 text-lg font-bold text-primary">
                                                        {item.product.price.toLocaleString('vi-VN')}đ
                                                    </div>

                                                    {/* Quantity & Actions */}
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center border rounded-lg overflow-hidden">
                                                            <button
                                                                onClick={() => handleQuantityChange(item, -1)}
                                                                disabled={item.quantity <= 1 || updateMutation.isPending}
                                                                className="p-2 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-40"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-12 text-center text-sm font-medium border-x py-2">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleQuantityChange(item, 1)}
                                                                disabled={updateMutation.isPending}
                                                                className="p-2 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-40"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className="font-bold text-gray-900 hidden sm:block">
                                                                {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                                                            </span>
                                                            <button
                                                                onClick={() => handleRemove(item)}
                                                                disabled={removeMutation.isPending}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {/* Continue Shopping */}
                            <div className="pt-4">
                                <Button variant="outline" asChild>
                                    <Link href="/products">
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Tiếp tục mua sắm
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
                            <Card className="border border-gray-100 shadow-sm sticky top-24">
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-5">Tóm tắt đơn hàng</h2>
                                    <Separator className="mb-5" />

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Tạm tính ({items.length} sản phẩm)</span>
                                            <span className="font-medium text-gray-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phí vận chuyển</span>
                                            {shippingFee === 0 ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs" variant="outline">Miễn phí</Badge>
                                            ) : (
                                                <span className="font-medium text-gray-900">{shippingFee.toLocaleString('vi-VN')}đ</span>
                                            )}
                                        </div>
                                        {shippingFee > 0 && (
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                Miễn phí vận chuyển cho đơn từ 500.000đ
                                            </p>
                                        )}
                                    </div>

                                    <Separator className="my-5" />

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="font-bold text-gray-900 text-base">Tổng cộng</span>
                                        <span className="font-bold text-primary text-xl">{total.toLocaleString('vi-VN')}đ</span>
                                    </div>

                                    <Button size="lg" className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" asChild>
                                        <Link href="/checkout">
                                            Tiến hành đặt hàng
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </Link>
                                    </Button>

                                    {/* Trust badges */}
                                    <div className="mt-6 space-y-3 pt-5 border-t">
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>Thanh toán an toàn & bảo mật</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <Truck className="h-4 w-4 text-blue-500 shrink-0" />
                                            <span>Giao hàng nhanh toàn quốc</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <RotateCcw className="h-4 w-4 text-amber-500 shrink-0" />
                                            <span>Đổi trả miễn phí trong 7 ngày</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </main>

        </>
    );
}
