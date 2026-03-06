'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/constants';
import { Loader2, Users, Trophy } from 'lucide-react';

export default function SellersAnalyticsPage() {
    const { data: sellersData, isLoading } = useQuery({
        queryKey: ['admin-sellers-analytics'],
        queryFn: () => adminAnalyticsService.getSellersAnalytics()
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
                <h1 className="text-3xl font-bold tracking-tight">Phân tích Người bán</h1>
                <p className="text-muted-foreground mt-1">
                    Hiệu suất và tăng trưởng của các shop trong hệ thống AlexStore.
                </p>
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
                        Top 10 Người bán doanh thu cao nhất
                    </CardTitle>
                    <CardDescription>Xếp hạng dựa trên tổng giá trị đơn hàng hoàn thành.</CardDescription>
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
                                    <TableCell className="font-bold text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{seller.username}</TableCell>
                                    <TableCell className="text-right font-semibold text-emerald-600">
                                        {formatCurrency(seller.revenue)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
