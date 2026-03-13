'use client';

import React, { useState } from 'react';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PackageX, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/constants';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ORDER_TABS = [
    { id: 'all', label: 'Tất cả', status: undefined },
    { id: 'pending_payment', label: 'Chờ thanh toán', status: 'PENDING' },
    { id: 'paid', label: 'Đã thanh toán', status: 'PAID' },
    { id: 'shipping', label: 'Vận chuyển', status: 'SHIPPING' },
    { id: 'completed', label: 'Hoàn thành', status: 'DELIVERED' },
    { id: 'cancelled', label: 'Đã hủy', status: 'CANCELLED' },
    { id: 'refund', label: 'Trả hàng/Hoàn tiền', status: 'REFUND' },
];

export default function BuyerOrdersPage() {
    const [activeTab, setActiveTab] = useState(ORDER_TABS[0]);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const cancelMutation = useMutation({
        mutationFn: (id: string) => ordersService.cancelOrder(id),
        onSuccess: () => {
            toast.success('Đã hủy đơn hàng thành công');
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || 'Không thể hủy đơn hàng';
            toast.error(message);
        }
    });

    const handleCancelOrder = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
            cancelMutation.mutate(id);
        }
    };

    const { data, isLoading } = useQuery({
        queryKey: ['my-orders', activeTab.status, page, debouncedSearch],
        queryFn: () => ordersService.getMyOrders({
            status: activeTab.status,
            page,
            limit: 5,
            search: debouncedSearch || undefined
        }),
    });

    const orders = data?.data || [];
    const meta = data?.meta;

    return (
        <ProfileLayout>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col min-h-[500px]">
                {/* Tabs Header */}
                <div className="flex overflow-x-auto hide-scrollbar border-b relative">
                    {ORDER_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab); setPage(1); }}
                            className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative z-10 
                                ${activeTab.id === tab.id ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-500'}`}
                        >
                            {tab.label}
                            {activeTab.id === tab.id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-gray-50 border-b">
                    <div className="relative max-w-2xl mx-auto md:mx-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Bạn có thể tìm kiếm theo Shop, ID đơn hàng hoặc Tên Sản phẩm"
                            className="pl-10 bg-white border-transparent focus-visible:ring-indigo-500 focus-visible:border-indigo-500 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Order List */}
                <div className="p-4 flex-1 flex flex-col bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-white rounded-full p-6 shadow-sm mb-4">
                                <PackageX className="h-16 w-16 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Chưa có đơn hàng</h3>
                            <p className="text-gray-500 mt-1 max-w-sm">Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm của bạn.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order: any) => (
                                <Card key={order.id} className="border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="bg-white px-5 py-3 border-b flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 font-medium text-gray-900">
                                                <Store className="h-4 w-4 text-gray-500" />
                                                {order.orderItems?.[0]?.product?.seller?.username || 'Alexander Store'}
                                            </div>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-xs text-gray-500 font-mono">ID: {order.orderCode}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            <span className="text-gray-500 font-medium">
                                                {PAYMENT_STATUS_CONFIG[order.paymentStatus as keyof typeof PAYMENT_STATUS_CONFIG]?.label || order.paymentStatus}
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            <span className={ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.color || 'text-gray-600'}>
                                                {ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG]?.label || order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-0">
                                        {order.orderItems?.map((item: any, index: number) => (
                                            <div key={index} className="px-5 py-4 border-b last:border-b-0 flex gap-4 bg-gray-50/30">
                                                <div className="h-20 w-20 flex-shrink-0 rounded-md border bg-white overflow-hidden relative">
                                                    {item.product?.images?.[0]?.imageUrl ? (
                                                        <img src={getImageUrl(item.product.images[0].imageUrl)} alt={item.product.name} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <PackageX className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div className="flex justify-between gap-4">
                                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product?.name || 'Sản phẩm'}</h4>
                                                        <div className="text-right">
                                                            <p className="text-indigo-600 font-medium whitespace-nowrap">{formatCurrency(item.priceAtPurchase)}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                    <div className="bg-white px-5 py-4 border-t flex flex-wrap items-center justify-between gap-4">
                                        <div className="text-sm text-gray-500 flex gap-1 items-center">
                                            <span>Thành tiền:</span>
                                            <span className="text-xl font-semibold text-indigo-600">{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Link href={`/profile/orders/${order.id}`}>
                                                <Button variant="outline">Xem chi tiết</Button>
                                            </Link>
                                            {order.status === 'COMPLETED' && (
                                                <Button className="bg-indigo-600 hover:bg-indigo-700">Mua lại</Button>
                                            )}
                                            {order.status === 'PENDING' || order.status === 'PENDING_PAYMENT' ? (
                                                <Button 
                                                    variant="destructive" 
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    disabled={cancelMutation.isPending}
                                                >
                                                    Hủy đơn
                                                </Button>
                                            ) : null}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            
                            {/* Pagination */}
                            {meta && meta.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 py-4 mt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                                        disabled={page === 1}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Trước
                                    </Button>
                                    <span className="text-sm font-medium text-gray-600">Trang {page} / {meta.totalPages}</span>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} 
                                        disabled={page >= meta.totalPages}
                                        className="gap-1"
                                    >
                                        Sau <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ProfileLayout>
    );
}
