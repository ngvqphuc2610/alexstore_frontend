'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import { DateRangeSelector, type DateRange } from '@/components/admin/analytics/date-range-selector';
import { SellerSelector } from '@/components/admin/analytics/seller-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/constants';
import { CategorySelector } from '@/components/admin/analytics/category-selector';
import { Pagination } from '@/components/admin/analytics/pagination';
import { Loader2, Users, Trophy } from 'lucide-react';

export default function SellersAnalyticsPage() {
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

    const { data: sellersData, isLoading } = useQuery({
        queryKey: ['admin-sellers-analytics', dateRange, sellerId, categoryId, page],
        queryFn: () => adminAnalyticsService.getSellersAnalytics(
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
                    <h1 className="text-3xl font-bold tracking-tight">Phân tích Người bán</h1>
                    <p className="text-muted-foreground mt-1">
                        Hiệu suất và tăng trưởng của các shop trong hệ thống AlexStore.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <CategorySelector value={categoryId} onValueChange={(val) => { setCategoryId(val); setPage(1); }} />
                    <SellerSelector value={sellerId} onValueChange={(val) => { setSellerId(val); setPage(1); }} />
                    <DateRangeSelector value={dateRange} onValueChange={(val) => { setDateRange(val); setPage(1); }} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Người bán đang hoạt động</CardDescription>
                        <CardTitle className="text-3xl font-bold flex items-center gap-2 text-blue-600">
                            <Users className="h-6 w-6" />
                            {sellersData?.activeSellers || 0}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Top 10 Người bán doanh thu cao nhất ({getRangeLabel()})
                    </CardTitle>
                    <CardDescription>Xếp hạng dựa trên tổng giá trị giao dịch trong khoảng thời gian này.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Thứ hạng</TableHead>
                                <TableHead>Tên shop</TableHead>
                                <TableHead className="text-right">Doanh thu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sellersData?.topSellers?.map((seller: any, index: number) => (
                                <TableRow key={seller.id}>
                                    <TableCell className="font-bold text-muted-foreground">{(page - 1) * 10 + index + 1}</TableCell>
                                    <TableCell className="font-medium">{seller.username}</TableCell>
                                    <TableCell className="text-right font-semibold text-emerald-600">
                                        {formatCurrency(seller.revenue)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {sellersData?.pagination && (
                        <Pagination
                            currentPage={page}
                            totalPages={sellersData.pagination.pages}
                            onPageChange={setPage}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
