'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Cell
} from 'recharts';
import { Loader2, Package, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function ProductsAnalyticsPage() {
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['admin-products-analytics'],
        queryFn: () => adminAnalyticsService.getProductsAnalytics()
    });

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Phân tích Sản phẩm</h1>
                <p className="text-muted-foreground mt-1">
                    Thống kê danh mục và các sản phẩm bán chạy nhất.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                            Top 5 Sản phẩm bán chạy
                        </CardTitle>
                        <CardDescription>Những sản phẩm có lượt mua cao nhất.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productsData?.topProducts} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="sold" fill="#10B981" radius={[0, 4, 4, 0]} barSize={30} label={{ position: 'right', fontSize: 12, fontWeight: 'bold' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-600">
                            <Package className="h-5 w-5" />
                            Tổng quan Sản phẩm
                        </CardTitle>
                        <CardDescription>Thống kê trạng thái các sản phẩm hiện tại.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 mt-4">
                            <div className="flex justify-between items-center p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tổng Sản phẩm</p>
                                    <h3 className="text-2xl font-bold">{productsData?.totalProducts || 0}</h3>
                                </div>
                                <Package className="h-8 w-8 text-indigo-500 opacity-80" />
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/20">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Đang Hoạt động</p>
                                    <h3 className="text-2xl font-bold">{productsData?.activeProducts || 0}</h3>
                                </div>
                                <TrendingUp className="h-8 w-8 text-emerald-500 opacity-80" />
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-lg bg-red-50/50 dark:bg-red-900/20">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Hết hàng</p>
                                    <h3 className="text-2xl font-bold">{productsData?.outOfStockProducts || 0}</h3>
                                </div>
                                <PieChartIcon className="h-8 w-8 text-red-500 opacity-80" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
