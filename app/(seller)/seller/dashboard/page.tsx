'use client';

import React from 'react';
import {
    Package,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    Plus,
    Loader2,
    Store,
    AlertTriangle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function SellerDashboard() {
    const { user } = useAuthStore();
    const shopName = (user as any)?.profile?.shopName || 'Gian hàng của bạn';

    // Fetch products for stats
    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['seller-products', user?.id],
        queryFn: async () => {
            const res = await fetch(`/api/proxy/products?sellerId=${user?.id}&status=all&limit=200`);
            if (!res.ok) return { data: [], meta: { total: 0 } };
            return res.json();
        },
        enabled: !!user?.id,
    });

    // Fetch orders for stats
    const { data: ordersRaw, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['seller-orders', user?.id],
        queryFn: async () => {
            const res = await fetch('/api/proxy/orders/seller/all');
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!user?.id,
    });

    // Normalize data
    const products = (() => {
        const d = productsData?.data ?? productsData ?? [];
        return Array.isArray(d) ? d : (d as any)?.data ?? [];
    })();

    const orders = (() => {
        const d = ordersRaw?.data ?? ordersRaw ?? [];
        return Array.isArray(d) ? d : [];
    })();

    // Compute real stats
    const totalProducts = products.length;
    const approvedProducts = products.filter((p: any) => p.status === 'APPROVED').length;
    const pendingProducts = products.filter((p: any) => p.status === 'PENDING').length;
    const lowStockProducts = products.filter((p: any) => p.stockQuantity <= 5 && p.status === 'APPROVED');
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'PAID').length;
    const totalRevenue = orders
        .filter((o: any) => o.status !== 'CANCELLED')
        .reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0);

    const recentOrders = orders.slice(0, 5);
    const isLoading = isLoadingProducts || isLoadingOrders;

    const stats = [
        {
            label: 'Tổng doanh thu',
            value: isLoading ? '...' : `${totalRevenue.toLocaleString('vi-VN')}₫`,
            icon: DollarSign,
            desc: 'Tổng giá trị đơn hàng (trừ đã hủy)',
            color: 'text-emerald-600 bg-emerald-50',
        },
        {
            label: 'Đơn hàng',
            value: isLoading ? '...' : String(totalOrders),
            icon: ShoppingCart,
            desc: `${pendingOrders} đơn đang chờ xử lý`,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            label: 'Sản phẩm đang bán',
            value: isLoading ? '...' : String(approvedProducts),
            icon: Package,
            desc: `${totalProducts} tổng / ${pendingProducts} chờ duyệt`,
            color: 'text-violet-600 bg-violet-50',
        },
        {
            label: 'Cảnh báo kho',
            value: isLoading ? '...' : String(lowStockProducts.length),
            icon: AlertTriangle,
            desc: 'Sản phẩm sắp hết hàng (≤ 5)',
            color: lowStockProducts.length > 0 ? 'text-orange-600 bg-orange-50' : 'text-gray-400 bg-gray-50',
        },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'outline';
            case 'PAID': return 'default';
            case 'SHIPPING': return 'secondary';
            case 'DELIVERED': return 'default';
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'PAID': return 'Đã thanh toán';
            case 'SHIPPING': return 'Đang giao';
            case 'DELIVERED': return 'Đã giao';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
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
                                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                                <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Cảnh báo: {lowStockProducts.length} sản phẩm sắp hết hàng
                        </CardTitle>
                        <CardDescription className="text-orange-600/80">
                            Những sản phẩm dưới đây có số lượng tồn kho ≤ 5. Hãy bổ sung kho hàng sớm!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {lowStockProducts.slice(0, 6).map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-orange-100">
                                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.name}</span>
                                    <Badge variant="destructive" className="text-xs ml-2 shrink-0">
                                        Còn {p.stockQuantity}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        {lowStockProducts.length > 6 && (
                            <Button variant="link" size="sm" className="text-orange-700 mt-2 p-0" asChild>
                                <Link href="/seller/products">Xem tất cả →</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <Card className="lg:col-span-2 border-none shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <CardTitle>Đơn hàng gần đây</CardTitle>
                            <CardDescription>Bạn có {pendingOrders} đơn hàng đang chờ xử lý.</CardDescription>
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
                        ) : recentOrders.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                    <ShoppingCart className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-500">Chưa có đơn hàng nào.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-emerald-50/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                                                {order.orderCode?.split('-')[0] || '#'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{order.orderCode}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{Number(order.totalAmount).toLocaleString('vi-VN')}₫</p>
                                                <p className="text-xs text-gray-500">{order.orderItems?.length || 0} sản phẩm</p>
                                            </div>
                                            <Badge variant={getStatusVariant(order.status) as any} className="capitalize min-w-[80px] justify-center">
                                                {getStatusLabel(order.status)}
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
