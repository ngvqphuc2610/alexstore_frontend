'use client';

import React, { useState } from 'react';
import {
    ShoppingCart,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    CreditCard,
    Calendar
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function SellerOrdersPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<string>('');

    const { data: orders, isLoading } = useQuery({
        queryKey: ['seller-orders', user?.id],
        queryFn: async () => {
            const res = await fetch('/api/proxy/orders/seller/all');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        },
        enabled: !!user?.id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
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
        }
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'PENDING': return 'outline';
            case 'PAID': return 'default';
            case 'SHIPPING': return 'secondary';
            case 'DELIVERED': return 'default';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xử lý';
            case 'PAID': return 'Đã thanh toán';
            case 'SHIPPING': return 'Đang giao hàng';
            case 'DELIVERED': return 'Đã giao hàng';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const handleUpdateStatus = () => {
        if (!selectedOrder || !statusToUpdate) return;
        updateStatusMutation.mutate({
            orderId: selectedOrder.id,
            status: statusToUpdate
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
                <p className="text-gray-500 text-sm">Theo dõi và cập nhật trạng thái các đơn hàng của bạn.</p>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 opacity-20" />
                        </div>
                    ) : orders?.data?.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                <ShoppingCart className="h-8 w-8 text-emerald-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Chưa có đơn hàng nào</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                Đơn hàng mới sẽ được hiển thị tại đây khi có khách hàng đặt mua sản phẩm của bạn.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead>Mã đơn hàng</TableHead>
                                        <TableHead>Ngày đặt</TableHead>
                                        <TableHead>Sản lượng</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.data?.map((order: any) => (
                                        <TableRow key={order.id} className="hover:bg-emerald-50/10">
                                            <TableCell className="font-bold text-emerald-900">
                                                {order.orderCode}
                                            </TableCell>
                                            <TableCell className="text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{order.orderItems.length} sản phẩm</span>
                                                    <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                                        {order.orderItems.map((i: any) => i.product.name).join(', ')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {Number(order.totalAmount).toLocaleString('vi-VN')}₫
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status) as any}>
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setStatusToUpdate(order.status);
                                                            setIsUpdateOpen(true);
                                                        }}
                                                    >
                                                        Cập nhật
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Update Status Dialog */}
            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật đơn hàng #{selectedOrder?.orderCode}</DialogTitle>
                        <DialogDescription>
                            Thay đổi trạng thái xử lý cho đơn hàng này.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Khách hàng</p>
                                    <p className="text-sm font-medium">Người mua #{selectedOrder.id.substring(0, 8)}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Ngày đặt</p>
                                    <p className="text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</p>
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
                                    <Truck className="h-4 w-4" />
                                    Địa chỉ giao hàng
                                </h4>
                                <p className="text-xs text-emerald-700 leading-relaxed">
                                    {selectedOrder.shippingAddress}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsUpdateOpen(false)}>Thoát</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={handleUpdateStatus}
                            disabled={updateStatusMutation.isPending}
                        >
                            {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
