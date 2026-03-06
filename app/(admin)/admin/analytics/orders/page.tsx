'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Loader2, ShoppingCart, Calendar, Info } from 'lucide-react';

const COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'];
const STATUS_LABELS: Record<string, string> = {
    'PENDING': 'Chờ xử lý',
    'PAID': 'Đã thanh toán',
    'SHIPPING': 'Đang giao',
    'DELIVERED': 'Đã giao',
    'CANCELLED': 'Đã hủy'
};

export default function OrdersAnalyticsPage() {
    const [range, setRange] = useState('30d');

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['admin-orders-analytics', range],
        queryFn: () => adminAnalyticsService.getOrdersAnalytics(range)
    });

    const totalOrders = ordersData?.totalOrders || 0;

    const distributionData = [
        { status: 'DELIVERED', count: ordersData?.completedOrders || 0 },
        { status: 'CANCELLED', count: ordersData?.cancelledOrders || 0 },
        { status: 'PENDING', count: Math.max(0, (ordersData?.totalOrders || 0) - ((ordersData?.completedOrders || 0) + (ordersData?.cancelledOrders || 0))) }
    ].filter(item => item.count > 0);

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
                    <h1 className="text-3xl font-bold tracking-tight">Phân tích Đơn hàng</h1>
                    <p className="text-muted-foreground mt-1">
                        Theo dõi lượng giao dịch và trạng thái đơn hàng trong hệ thống.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Chọn khoảng thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">7 ngày qua</SelectItem>
                            <SelectItem value="30d">30 ngày qua</SelectItem>
                            <SelectItem value="this_month">Tháng này</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle>Xu hướng Đơn hàng</CardTitle>
                        <CardDescription>Số lượng đơn hàng mới mỗi ngày ({range})</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ordersData?.ordersByDate}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="orders" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription>Tổng lượt đặt ({range})</CardDescription>
                            <CardTitle className="text-3xl font-bold flex items-center gap-2 text-indigo-600">
                                <ShoppingCart className="h-6 w-6" />
                                {totalOrders}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Phân bổ Trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="status"
                                        >
                                            {distributionData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(val: any, name: any) => [val, STATUS_LABELS[name] || name]}
                                        />
                                        <Legend verticalAlign="bottom" height={36} formatter={(value) => STATUS_LABELS[value] || value} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
