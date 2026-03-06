'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import { DateRangeSelector, type DateRange } from '@/components/admin/analytics/date-range-selector';
import { SellerSelector } from '@/components/admin/analytics/seller-selector';
import { CategorySelector } from '@/components/admin/analytics/category-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatCurrency } from '@/lib/constants';
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
import { Pagination } from '@/components/admin/analytics/pagination';
import { Loader2, Package, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function ProductsAnalyticsPage() {
    const [dateRange, setDateRange] = useState<DateRange>({ range: '30d' });
    const [sellerId, setSellerId] = useState('all');
    const [categoryId, setCategoryId] = useState('all');
    const [page, setPage] = useState(1);

    const getRangeLabel = () => {
        switch (dateRange.range) {
            case 'today': return 'Hôm nay';
            case '7d': return '7 ngày qua';
            case '30d': return '30 ngày qua';
            case 'this_month': return 'Tháng này';
            case 'last_month': return 'Tháng trước';
            case 'custom_range':
                if (dateRange.from && dateRange.to) {
                    return `${dateRange.from} - ${dateRange.to}`;
                }
                return 'Tùy chọn';
            default: return '30 ngày qua';
        }
    };

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['admin-products-analytics', dateRange, sellerId, categoryId, page],
        queryFn: () => adminAnalyticsService.getProductsAnalytics(
            dateRange.range,
            sellerId === 'all' ? undefined : sellerId,
            categoryId === 'all' ? undefined : categoryId,
            dateRange.from,
            dateRange.to,
            page,
            10
        )
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Phân tích Sản phẩm</h1>
                    <p className="text-muted-foreground mt-1">
                        Thống kê danh mục và các sản phẩm bán chạy nhất.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <CategorySelector value={categoryId} onValueChange={(val) => { setCategoryId(val); setPage(1); }} />
                    <SellerSelector value={sellerId} onValueChange={(val) => { setSellerId(val); setPage(1); }} />
                    <DateRangeSelector value={dateRange} onValueChange={(val) => { setDateRange(val); setPage(1); }} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-600">
                            <TrendingUp className="h-5 w-5" />
                            Top 10 Sản phẩm bán chạy ({getRangeLabel()})
                        </CardTitle>
                        <CardDescription>Những sản phẩm có lượt mua cao nhất trong khoảng thời gian này.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Thứ hạng</TableHead>
                                    <TableHead>Tên sản phẩm</TableHead>
                                    <TableHead className="text-right">Đã bán</TableHead>
                                    <TableHead className="text-right">Doanh thu</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productsData?.topProducts?.map((product: any, index: number) => (
                                    <TableRow key={`${product.id}-${index}`}>
                                        <TableCell className="font-bold text-muted-foreground">{(page - 1) * 10 + index + 1}</TableCell>
                                        <TableCell className="font-medium truncate max-w-[200px]">{product.name}</TableCell>
                                        <TableCell className="text-right font-semibold">{product.sold}</TableCell>
                                        <TableCell className="text-right font-semibold text-emerald-600">
                                            {formatCurrency(product.revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {productsData?.pagination && (
                            <Pagination
                                currentPage={page}
                                totalPages={productsData.pagination.pages}
                                onPageChange={setPage}
                            />
                        )}
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
