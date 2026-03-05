'use client';

import React from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Loader2,
    Store
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function SellerDashboard() {
    const { user } = useAuthStore();
    const shopName = (user as any)?.profile?.shopName || 'Gian hàng của bạn';

    // Dummy data for stats while waiting for real endpoints
    const stats = [
        { label: 'Doanh thu tháng này', value: '45,200,000₫', icon: DollarSign, trend: '+12.5%', isUp: true },
        { label: 'Đơn hàng mới', value: '12', icon: ShoppingCart, trend: '+3', isUp: true },
        { label: 'Sản phẩm đang bán', value: '48', icon: Package, trend: '0%', isUp: true },
        { label: 'Lượt đánh giá', value: '4.8', icon: TrendingUp, trend: '+0.2', isUp: true },
    ];

    const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['seller-orders-recent'],
        queryFn: async () => {
            const res = await fetch('/api/proxy/orders/seller/all');
            if (!res.ok) return [];
            const result = await res.json();
            return result.data?.slice(0, 5) || [];
        }
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'outline';
            case 'PAID': return 'default';
            case 'SHIPPING': return 'secondary';
            case 'DELIVERED': return 'default';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại, {shopName}! 👋</h1>
                    <p className="text-gray-500">Đây là cái nhìn tổng quan về gian hàng của bạn ngày hôm nay.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        Xuất báo cáo
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                        <Link href="/seller/products">
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm sản phẩm
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className={`flex items-center text-xs font-medium ${stat.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {stat.trend}
                                    {stat.isUp ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <Card className="lg:col-span-2 border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle>Đơn hàng gần đây</CardTitle>
                            <CardDescription>Bạn có {recentOrders?.length || 0} đơn hàng mới.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-emerald-600" asChild>
                            <Link href="/seller/orders">Xem tất cả</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingOrders ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 opacity-20" />
                            </div>
                        ) : recentOrders?.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                    <ShoppingCart className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">Chưa có đơn hàng nào.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentOrders?.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-emerald-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                                                {order.orderCode.split('-')[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{order.orderCode}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{order.totalAmount.toLocaleString('vi-VN')}₫</p>
                                                <p className="text-xs text-gray-500">{order.orderItems.length} sản phẩm</p>
                                            </div>
                                            <Badge variant={getStatusVariant(order.status) as any} className="capitalize">
                                                {order.status.toLowerCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions / Tips */}
                <Card className="border-none shadow-sm h-full bg-emerald-900 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-emerald-400" />
                            Gợi ý cho shop
                        </CardTitle>
                        <CardDescription className="text-emerald-100/70">Mẹo để tăng doanh thu của bạn.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {[
                                { title: "Hoàn thiện mô tả sản phẩm", desc: "Sử dụng từ khóa và hình ảnh chất lượng cao để thu hút khách hàng." },
                                { title: "Ưu đãi Flash Sale", desc: "Tham gia chương trình khuyến mãi để tiếp cận hàng triệu khách hàng." },
                                { title: "Phản hồi đánh giá", desc: "Tăng độ uy tín bằng cách trả lời tích cực các nhận xét của người mua." }
                            ].map((tip, i) => (
                                <div key={i} className="group p-4 rounded-xl bg-emerald-800/50 hover:bg-emerald-800 transition-colors cursor-pointer border border-emerald-700/50">
                                    <h4 className="text-sm font-bold mb-1 group-hover:text-emerald-400 transition-colors">{tip.title}</h4>
                                    <p className="text-xs text-emerald-100/60 leading-relaxed">{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold">
                            Khám phá tất cả mẹo
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
