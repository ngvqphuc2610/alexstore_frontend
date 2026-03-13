'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, MapPin, CreditCard, Store } from 'lucide-react';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/constants';
import { getImageUrl } from '@/lib/utils';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => ordersService.getById(orderId),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-gray-500">Trang chi tiết đơn hàng không tìm thấy hoặc bạn không có quyền truy cập.</p>
                <Button onClick={() => router.back()} variant="outline">Quay lại</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> TRỞ LẠI
                </button>
                <div className="flex gap-4 items-center">
                    <span className="text-sm text-gray-500 font-mono">Mã Đơn Hàng: {order.orderCode}</span>
                    <span className="text-gray-300">|</span>
                    <span className={`font-medium ${ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.color || 'text-gray-600'}`}>
                        {ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.label || order.status}
                    </span>
                </div>
            </div>

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-0 bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-indigo-500" />
                            Địa chỉ nhận hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600 space-y-2">
                        <p className="font-medium text-gray-900">{order.buyer?.username || 'Khách hàng'}</p>
                        <p>{order.shippingAddress || 'Không có thông tin địa chỉ trên hệ thống'}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-0 bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-indigo-500" />
                            Thông tin thanh toán
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600 space-y-2">
                        <p><strong>Phương thức:</strong> {order.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : 'Thanh toán khi nhận hàng (COD)'}</p>
                        <p><strong>Trạng thái:</strong> {PAYMENT_STATUS_CONFIG[order.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG]?.label || order.paymentStatus}</p>
                        <p><strong>Ngày đặt hàng:</strong> {formatDate(order.createdAt)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Product List */}
            <Card className="shadow-sm border-0 overflow-hidden bg-white">
                <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-indigo-500" />
                        Sản phẩm đã mua
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="bg-white px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                            <Store className="h-4 w-4 text-gray-500" />
                            {order.orderItems?.[0]?.product?.seller?.username || 'Alexander Store'}
                        </div>
                    </div>
                    {order.orderItems?.map((item: any, index: number) => (
                        <div key={index} className="px-6 py-5 border-b last:border-b-0 flex gap-4">
                            <div className="h-24 w-24 flex-shrink-0 rounded-md border bg-white overflow-hidden relative">
                                {item.product?.images?.[0]?.imageUrl ? (
                                    <img src={getImageUrl(item.product.images[0].imageUrl)} alt={item.product?.name || 'Sản phẩm'} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between gap-4">
                                    <h4 className="text-base font-medium text-gray-900">{item.product?.name || 'Sản phẩm'}</h4>
                                    <p className="text-gray-900 font-medium whitespace-nowrap">{formatCurrency(item.priceAtPurchase)}</p>
                                </div>
                                <p className="text-sm text-gray-500">Số lượng: x{item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
                
                {/* Order Summary */}
                <div className="bg-gray-50 px-6 py-5 border-t">
                    <div className="space-y-3 max-w-sm ml-auto text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Tổng tiền hàng</span>
                            <span>{formatCurrency(order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Phí vận chuyển</span>
                            <span>{formatCurrency(0)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                            <span>Thành tiền</span>
                            <span className="text-indigo-600">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
