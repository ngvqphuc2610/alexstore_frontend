'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import { DateRangeSelector, type DateRange } from '@/components/admin/analytics/date-range-selector';
import { SellerSelector } from '@/components/admin/analytics/seller-selector';
import { CategorySelector } from '@/components/admin/analytics/category-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/constants';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip
} from 'recharts';
import { Loader2, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function RevenueAnalyticsPage() {
    const [dateRange, setDateRange] = useState<DateRange>({ range: '30d' });
    const [sellerId, setSellerId] = useState('all');
    const [categoryId, setCategoryId] = useState('all');

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

    const { data: revenueData, isLoading } = useQuery({
        queryKey: ['admin-revenue-analytics', dateRange, sellerId, categoryId],
        queryFn: () => adminAnalyticsService.getRevenueAnalytics(
            dateRange.range,
            sellerId === 'all' ? undefined : sellerId,
            categoryId === 'all' ? undefined : categoryId,
            dateRange.from,
            dateRange.to
        )
    });

    const totalRevenue = revenueData?.totalRevenue || 0;
    const avgDaily = revenueData?.revenueByDate?.length ? totalRevenue / revenueData.revenueByDate.length : 0;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Phân tích Doanh thu</h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi biến động dòng tiền và doanh thu toàn hệ thống.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <CategorySelector value={categoryId} onValueChange={setCategoryId} />
                    <SellerSelector value={sellerId} onValueChange={setSellerId} />
                    <DateRangeSelector value={dateRange} onValueChange={setDateRange} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Tổng doanh thu ({getRangeLabel()})</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-500" />
                            {formatCurrency(totalRevenue)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription>Doanh thu trung bình/ngày</CardDescription>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            {formatCurrency(avgDaily)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Biểu đồ Doanh thu chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData?.revenueByDate}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val: any) => [formatCurrency(val), 'Doanh thu']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
