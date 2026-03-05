'use client';

import { useState } from 'react';
import {
    ShoppingCart,
    Search,
    MoreHorizontal,
    Eye,
    Filter,
    Truck,
    CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/constants';
import type { OrderStatus, PaymentStatus } from '@/types';
import { CopyableId } from '@/components/shared/CopyableId';

// ─── Mock Data (1-2 items for testing) ────────────────────────────────────────
const mockOrders = [
    {
        id: '018e698b-24b5-7123-9a8b-fedcba987654',
        orderCode: 'ORD-2026-001',
        buyer: 'Nguyễn Văn A',
        buyerEmail: 'a@email.com',
        totalAmount: 1250000,
        status: 'PENDING' as OrderStatus,
        paymentMethod: 'COD',
        paymentStatus: 'UNPAID' as PaymentStatus,
        shippingAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
        createdAt: '2026-03-03T10:30:00Z',
        items: [
            { name: 'iPhone 16 Pro Max 256GB', quantity: 1, price: 1250000 },
        ],
    },
    {
        id: '018e698b-3cde-7517-8e6f-7c1573980f91',
        orderCode: 'ORD-2026-002',
        buyer: 'Trần Thị B',
        buyerEmail: 'b@email.com',
        totalAmount: 3890000,
        status: 'PAID' as OrderStatus,
        paymentMethod: 'BANK_TRANSFER',
        paymentStatus: 'PAID' as PaymentStatus,
        shippingAddress: '456 Lê Lợi, Q3, TP.HCM',
        createdAt: '2026-03-03T09:15:00Z',
        items: [
            { name: 'AirPods Pro 3', quantity: 1, price: 890000 },
            { name: 'Ốp lưng iPhone', quantity: 1, price: 3000000 },
        ],
    },
];

export default function AdminOrdersPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

    const sortedOrders = [...mockOrders].sort((a, b) => a.id.localeCompare(b.id));

    const filteredOrders = sortedOrders.filter((order) => {
        const matchesSearch =
            order.orderCode.toLowerCase().includes(search.toLowerCase()) ||
            order.buyer.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                <p className="text-muted-foreground mt-1">Theo dõi và cập nhật trạng thái đơn hàng</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                {(['PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((status) => (
                    <Card key={status} className="border-0 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{mockOrders.filter(o => o.status === status).length}</div>
                            <p className="text-xs text-muted-foreground">{ORDER_STATUS_CONFIG[status].label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Tìm theo mã đơn, người mua..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Lọc trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                <SelectItem value="SHIPPING">Đang giao</SelectItem>
                                <SelectItem value="DELIVERED">Đã giao</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Mã đơn</TableHead>
                                <TableHead>Người mua</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Thanh toán</TableHead>
                                <TableHead>Phương thức</TableHead>
                                <TableHead>Ngày đặt</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order, index) => (
                                <TableRow key={order.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium text-muted-foreground">
                                        #{index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <CopyableId id={order.id} />
                                    </TableCell>
                                    <TableCell className="font-medium text-indigo-600">{order.orderCode}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{order.buyer}</p>
                                            <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(order.totalAmount)}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} configMap={ORDER_STATUS_CONFIG} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.paymentStatus} configMap={PAYMENT_STATUS_CONFIG} />
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{order.paymentMethod}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDetailDialogOpen(true); }}>
                                                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => { setSelectedOrder(order); setUpdateDialogOpen(true); }}>
                                                    <Truck className="mr-2 h-4 w-4" /> Cập nhật trạng thái
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Hiển thị {filteredOrders.length} / {mockOrders.length} đơn hàng
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Trước</Button>
                            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                            <Button variant="outline" size="sm" disabled>Sau</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                        <DialogDescription>{selectedOrder?.orderCode}</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Người mua</p>
                                    <p className="font-medium">{selectedOrder.buyer}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedOrder.buyerEmail}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Trạng thái</p>
                                    <StatusBadge status={selectedOrder.status} configMap={ORDER_STATUS_CONFIG} />
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Thanh toán</p>
                                    <StatusBadge status={selectedOrder.paymentStatus} configMap={PAYMENT_STATUS_CONFIG} />
                                </div>
                                <div className="col-span-2">
                                    <p className="text-muted-foreground">Địa chỉ giao hàng</p>
                                    <p className="font-medium">{selectedOrder.shippingAddress}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium mb-2">Sản phẩm</p>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-muted/50 rounded-lg p-3 text-sm">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">{formatCurrency(item.price)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex justify-between items-center border-t pt-3">
                                    <span className="font-medium">Tổng cộng</span>
                                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
                        <DialogDescription>Đơn hàng: {selectedOrder?.orderCode}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Trạng thái đơn hàng</Label>
                            <Select defaultValue={selectedOrder?.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                    <SelectItem value="SHIPPING">Đang giao</SelectItem>
                                    <SelectItem value="DELIVERED">Đã giao</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Trạng thái thanh toán</Label>
                            <Select defaultValue={selectedOrder?.paymentStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                    <SelectItem value="FAILED">Thất bại</SelectItem>
                                    <SelectItem value="REFUNDED">Hoàn tiền</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Hủy</Button>
                        <Button onClick={() => setUpdateDialogOpen(false)}>Cập nhật</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
