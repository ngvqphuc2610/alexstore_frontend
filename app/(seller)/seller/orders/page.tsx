'use client';

import React, { useState, useMemo } from 'react';
import {
    ShoppingCart,
    Search,
    Eye,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    MapPin,
    CreditCard,
    Calendar,
    DollarSign,
    AlertCircle,
    Ban,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { OrderDetailDialog } from '@/components/seller/OrderDetailDialog';
import type { Order, OrderStatus } from '@/types';

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; badgeClass: string }> = {
    PENDING: { label: 'Chờ xử lý', icon: Clock, badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    PAID: { label: 'Đã thanh toán', icon: CreditCard, badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
    SHIPPING: { label: 'Đang giao hàng', icon: Truck, badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    DELIVERED: { label: 'Đã giao hàng', icon: CheckCircle2, badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', icon: Ban, badgeClass: 'bg-red-100 text-red-800 border-red-200' },
};

const STATUS_TABS = [
    { key: 'ALL', label: 'Tất cả', icon: Package },
    { key: 'PENDING', label: 'Chờ xử lý', icon: Clock },
    { key: 'PAID', label: 'Đã TT', icon: CreditCard },
    { key: 'SHIPPING', label: 'Đang giao', icon: Truck },
    { key: 'DELIVERED', label: 'Đã giao', icon: CheckCircle2 },
    { key: 'CANCELLED', label: 'Đã hủy', icon: Ban },
];

export default function SellerOrdersPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<string>('');

    // ─── Fetch seller orders ─────────────────────────────────────────────
    const { data: ordersRaw, isLoading } = useQuery({
        queryKey: ['seller-orders', user?.id],
        queryFn: async () => {
            const res = await fetch('/api/proxy/orders/seller/all');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        },
        enabled: !!user?.id,
    });

    // ─── Update status mutation ──────────────────────────────────────────
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const res = await fetch(`/api/proxy/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Không thể cập nhật trạng thái');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Đã cập nhật trạng thái đơn hàng');
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            setIsUpdateOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra khi cập nhật');
        },
    });

    // ─── Normalize data ──────────────────────────────────────────────────
    const orders: Order[] = useMemo(() => {
        const d = ordersRaw?.data ?? ordersRaw ?? [];
        return Array.isArray(d) ? d : [];
    }, [ordersRaw]);

    // ─── Stats ───────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const pending = orders.filter((o) => o.status === 'PENDING' || o.status === 'PAID').length;
        const shipping = orders.filter((o) => o.status === 'SHIPPING').length;
        const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
        const revenue = orders
            .filter((o) => o.status !== 'CANCELLED')
            .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        return [
            {
                label: 'Tổng đơn hàng',
                value: orders.length,
                icon: ShoppingCart,
                color: 'text-blue-600 bg-blue-50',
            },
            {
                label: 'Chờ xử lý',
                value: pending,
                icon: AlertCircle,
                color: 'text-yellow-600 bg-yellow-50',
            },
            {
                label: 'Đang giao',
                value: shipping,
                icon: Truck,
                color: 'text-indigo-600 bg-indigo-50',
            },
            {
                label: 'Doanh thu',
                value: `${revenue.toLocaleString('vi-VN')}₫`,
                icon: DollarSign,
                color: 'text-emerald-600 bg-emerald-50',
            },
        ];
    }, [orders]);

    // ─── Filtered orders ─────────────────────────────────────────────────
    const filteredOrders = useMemo(() => {
        let list = orders;
        if (activeTab !== 'ALL') {
            list = list.filter((o) => o.status === activeTab);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            list = list.filter(
                (o) =>
                    o.orderCode.toLowerCase().includes(q) ||
                    o.orderItems?.some((item) =>
                        item.product?.name?.toLowerCase().includes(q)
                    )
            );
        }
        return list;
    }, [orders, activeTab, searchTerm]);

    // ─── Handlers ────────────────────────────────────────────────────────
    const handleUpdateStatus = () => {
        if (!selectedOrder || !statusToUpdate) return;
        updateStatusMutation.mutate({ orderId: selectedOrder.id, status: statusToUpdate });
    };

    const openUpdateDialog = (order: Order) => {
        setSelectedOrder(order);
        setStatusToUpdate(order.status);
        setIsUpdateOpen(true);
    };

    // ─── Render ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                <p className="text-gray-500 text-sm">
                    Theo dõi và cập nhật trạng thái các đơn hàng của bạn.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                                {isLoading ? '...' : stat.value}
                            </h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Orders Card */}
            <Card className="border-none shadow-sm overflow-hidden">
                {/* Toolbar: Tabs + Search */}
                <CardHeader className="bg-white border-b py-4 space-y-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {STATUS_TABS.map((tab) => {
                            const isActive = activeTab === tab.key;
                            const count =
                                tab.key === 'ALL'
                                    ? orders.length
                                    : orders.filter((o) => o.status === tab.key).length;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                >
                                    <tab.icon className="h-3.5 w-3.5" />
                                    {tab.label}
                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded-full ${isActive
                                                ? 'bg-emerald-200 text-emerald-900'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
                            className="pl-10 h-10 border-emerald-100 focus:border-emerald-300 focus:ring-emerald-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>

                {/* Table */}
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 opacity-20" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                <ShoppingCart className="h-8 w-8 text-emerald-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {searchTerm || activeTab !== 'ALL'
                                    ? 'Không tìm thấy đơn hàng'
                                    : 'Chưa có đơn hàng nào'}
                            </h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                {searchTerm
                                    ? 'Thử tìm kiếm với từ khóa khác.'
                                    : activeTab !== 'ALL'
                                        ? 'Không có đơn hàng nào ở trạng thái này.'
                                        : 'Đơn hàng sẽ xuất hiện khi có khách mua sản phẩm của bạn.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Ngày đặt</TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => {
                                        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <TableRow key={order.id} className="hover:bg-emerald-50/30 transition-colors">
                                                <TableCell className="font-bold text-emerald-900">
                                                    {order.orderCode}
                                                </TableCell>
                                                <TableCell className="text-gray-500 text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {order.orderItems?.length || 0} sản phẩm
                                                        </span>
                                                        <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                                            {order.orderItems
                                                                ?.map((i) => i.product?.name)
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {Number(order.totalAmount).toLocaleString('vi-VN')}₫
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${cfg.badgeClass} border text-xs gap-1`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {cfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                                            onClick={() => setDetailOrder(order)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Chi tiết
                                                        </Button>
                                                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                                                                onClick={() => openUpdateDialog(order)}
                                                            >
                                                                Cập nhật
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Detail Dialog */}
            <OrderDetailDialog
                open={!!detailOrder}
                onOpenChange={(open) => { if (!open) setDetailOrder(null); }}
                order={detailOrder}
            />

            {/* Update Status Dialog */}
            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật đơn hàng #{selectedOrder?.orderCode}</DialogTitle>
                        <DialogDescription>
                            Thay đổi trạng thái xử lý cho đơn hàng này.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                        Tổng tiền
                                    </p>
                                    <p className="text-sm font-bold text-emerald-700">
                                        {Number(selectedOrder.totalAmount).toLocaleString('vi-VN')}₫
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                        Ngày đặt
                                    </p>
                                    <p className="text-sm font-medium">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-900">Trạng thái mới</label>
                                <Select value={statusToUpdate} onValueChange={setStatusToUpdate}>
                                    <SelectTrigger className="w-full h-12">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Chờ xử lý (Pending)</SelectItem>
                                        <SelectItem value="PAID">Đã thanh toán (Paid)</SelectItem>
                                        <SelectItem value="SHIPPING">Đang giao hàng (Shipping)</SelectItem>
                                        <SelectItem value="DELIVERED">Đã giao hàng (Delivered)</SelectItem>
                                        <SelectItem value="CANCELLED">Hủy đơn (Cancelled)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="bg-emerald-50 p-4 rounded-xl space-y-2 border border-emerald-100">
                                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Địa chỉ giao hàng
                                </h4>
                                <p className="text-xs text-emerald-700 leading-relaxed">
                                    {selectedOrder.shippingAddress}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUpdateOpen(false)}>
                            Thoát
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleUpdateStatus}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
