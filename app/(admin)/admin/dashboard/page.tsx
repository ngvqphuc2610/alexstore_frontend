'use client';

import {
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
    ORDER_STATUS_CONFIG,
    PAYMENT_STATUS_CONFIG,
    PRODUCT_STATUS_CONFIG,
    formatCurrency,
    formatDate,
} from '@/lib/constants';
import Link from 'next/link';

// ─── Stat Card Component ──────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: React.ElementType;
    trend?: { value: number; isPositive: boolean };
    iconColor: string;
    iconBg: string;
}

function StatCard({ title, value, description, icon: Icon, trend, iconColor, iconBg }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
            <div className="absolute top-0 right-0 h-24 w-24 -translate-y-4 translate-x-4 rounded-full opacity-10" style={{ background: iconColor }} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`rounded-xl p-2.5 ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                <div className="mt-1 flex items-center gap-1">
                    {trend && (
                        <>
                            {trend.isPositive ? (
                                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {trend.value}%
                            </span>
                        </>
                    )}
                    <span className="text-xs text-muted-foreground">{description}</span>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const recentOrders = [
    { id: '1', orderCode: 'ORD-2026-001', buyer: 'Nguyễn Văn A', total: 1250000, status: 'PENDING' as const, paymentStatus: 'UNPAID' as const, createdAt: '2026-03-03T10:30:00Z' },
    { id: '2', orderCode: 'ORD-2026-002', buyer: 'Trần Thị B', total: 3890000, status: 'PAID' as const, paymentStatus: 'PAID' as const, createdAt: '2026-03-03T09:15:00Z' },
];

const pendingProducts = [
    { id: '1', name: 'iPhone 16 Pro Max 256GB', seller: 'TechWorld Store', price: 34990000, createdAt: '2026-03-03T08:00:00Z' },
];

const recentUsers = [
    { id: '1', username: 'nguyenvana', email: 'a@email.com', role: 'BUYER', createdAt: '2026-03-03T12:00:00Z' },
];


import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Loader2 } from 'lucide-react';

const COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'];
const STATUS_LABELS: Record<string, string> = {
    'PENDING': 'Chờ xử lý',
    'PAID': 'Đã thanh toán',
    'SHIPPING': 'Đang giao',
    'DELIVERED': 'Đã giao',
    'CANCELLED': 'Đã hủy'
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const { data: overview, isLoading: isLoadingOverview } = useQuery({
        queryKey: ['admin-overview'],
        queryFn: () => adminAnalyticsService.getOverview()
    });

    const { data: revenueData, isLoading: isLoadingRevenue } = useQuery({
        queryKey: ['admin-revenue-trend'],
        queryFn: () => adminAnalyticsService.getRevenueAnalytics('30d')
    });

    const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['admin-orders-distribution'],
        queryFn: () => adminAnalyticsService.getOrdersAnalytics('30d')
    });

    if (isLoadingOverview || isLoadingRevenue || isLoadingOrders) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const orderDistribution = ordersData ? [
        { status: 'DELIVERED', count: ordersData.completedOrders || 0 },
        { status: 'CANCELLED', count: ordersData.cancelledOrders || 0 },
        { status: 'PENDING', count: Math.max(0, (ordersData.totalOrders || 0) - ((ordersData.completedOrders || 0) + (ordersData.cancelledOrders || 0))) }
    ].filter((i: any) => i.count > 0) : [];

    return (
        <div className="space-y-6 pb-12">
            {/* Page header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan hệ thống</h1>
                <p className="text-muted-foreground mt-1">
                    Báo cáo số liệu toàn diện của AlexStore trong 30 ngày qua.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng Người dùng"
                    value={overview?.totalUsers?.toLocaleString() || 0}
                    description="Thành viên mua hàng"
                    icon={Users}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                />
                <StatCard
                    title="Tổng Người bán"
                    value={overview?.totalSellers?.toLocaleString() || 0}
                    description="Đối tác bán hàng"
                    icon={ShieldCheck}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-100 dark:bg-amber-900/30"
                />
                <StatCard
                    title="Tổng Đơn hàng"
                    value={overview?.totalOrders?.toLocaleString() || 0}
                    description="Tổng lượng giao dịch"
                    icon={ShoppingCart}
                    iconColor="text-indigo-600"
                    iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                />
                <StatCard
                    title="Doanh thu (GMV)"
                    value={formatCurrency(overview?.totalRevenue || 0)}
                    description="Tổng giá trị hàng hóa"
                    icon={DollarSign}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Xu hướng Doanh thu</CardTitle>
                        <CardDescription>Biểu đồ doanh thu hàng ngày theo hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData?.revenueByDate}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val: any) => [formatCurrency(val), 'Doanh thu']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Trạng thái Đơn hàng</CardTitle>
                        <CardDescription>Phân bổ theo trạng thái hiện tại</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {orderDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(val: any, name: any) => [val, STATUS_LABELS[name] || name]}
                                    />
                                    <Legend formatter={(value) => STATUS_LABELS[value] || value} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Orders (2 cols) */}
                <Card className="lg:col-span-2 border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Đơn hàng gần đây</CardTitle>
                            <CardDescription>5 đơn hàng mới nhất trong hệ thống</CardDescription>
                        </div>
                        <Link href="/admin/orders">
                            <Button variant="outline" size="sm" className="gap-1">
                                Xem tất cả
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã đơn</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thanh toán</TableHead>
                                    <TableHead className="text-right">Ngày đặt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium text-indigo-600">{order.orderCode}</TableCell>
                                        <TableCell>{order.buyer}</TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={order.status} configMap={ORDER_STATUS_CONFIG} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={order.paymentStatus} configMap={PAYMENT_STATUS_CONFIG} />
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {formatDate(order.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Sidebar cards */}
                <div className="space-y-6">
                    {/* Pending Products */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                    Chờ duyệt
                                </CardTitle>
                                <CardDescription>{pendingProducts.length} sản phẩm</CardDescription>
                            </div>
                            <Link href="/admin/products">
                                <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pendingProducts.map((product) => (
                                <div key={product.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.seller}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold text-emerald-600">{formatCurrency(product.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* New Users */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Thành viên mới
                                </CardTitle>
                                <CardDescription>Đăng ký gần đây</CardDescription>
                            </div>
                            <Link href="/admin/users">
                                <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                                        {user.username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{user.username}</p>
                                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <Badge variant="outline" className="shrink-0 text-xs">
                                        {user.role === 'SELLER' ? 'Người bán' : 'Người mua'}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
