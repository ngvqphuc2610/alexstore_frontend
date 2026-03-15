'use client';

import { useState } from 'react';
import {
    Search,
    ShieldCheck,
    ShieldBan,
    Store,
    MapPin,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/constants';
import type { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { CopyableId } from '@/components/shared/CopyableId';

export default function AdminSellerRequestsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    // Dialog states
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // ─── Queries ─────────────────────────────────────────────────────────────
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['pending-sellers', page, limit],
        queryFn: () => userService.getPendingSellers(page, limit),
    });

    console.log('DEBUG SellerRequests Response:', response);

    const pendingUsers = response?.data || [];
    const meta = response?.data.meta|| { total: 0, page: 1, limit: 20, totalPages: 1 };

    // ─── Mutations ───────────────────────────────────────────────────────────
    const approveMutation = useMutation({
        mutationFn: userService.approveSeller,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
            queryClient.invalidateQueries({ queryKey: ['users'] }); // Also update users list
            setApproveDialogOpen(false);
            toast.success('Đã duyệt yêu cầu mở shop thành công');
        },
        onError: (error: any) => toast.error(error.message),
    });

    const rejectMutation = useMutation({
        mutationFn: userService.rejectSeller,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
            queryClient.invalidateQueries({ queryKey: ['users'] }); // Also update users list
            setRejectDialogOpen(false);
            toast.success('Đã từ chối yêu cầu mở shop');
        },
        onError: (error: any) => toast.error(error.message),
    });

    // ─── Handlers ────────────────────────────────────────────────────────────
    const filteredUsers = pendingUsers.filter((user: User) => {
        const matchesSearch =
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            (user.sellerProfile as any)?.shopName?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Duyệt người bán</h1>
                <p className="text-muted-foreground mt-1">Quản lý và xét duyệt các yêu cầu đăng ký mở shop từ người mua</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600 flex items-center gap-2">
                            {isLoading ? <Skeleton className="h-8 w-12" /> : meta.total}
                        </div>
                        <p className="text-xs text-muted-foreground">Yêu cầu đang chờ duyệt</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên người dùng, email, tên shop..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-10 text-red-500">
                            <AlertCircle className="h-10 w-10 mb-2" />
                            <p>Không thể tải danh sách yêu cầu. Vui lòng thử lại sau.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Người dùng</TableHead>
                                    <TableHead>Thông tin Shop (Yêu cầu)</TableHead>
                                    <TableHead>Địa chỉ lấy hàng</TableHead>
                                    <TableHead>Mã số QA/Thuế</TableHead>
                                    <TableHead>Ngày gửi</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user: User, index: number) => {
                                    const profile = user.sellerProfile as any;
                                    const actualIndex = (page - 1) * limit + index + 1;

                                    return (
                                        <TableRow key={user.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-muted-foreground">
                                                #{actualIndex}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.username}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                        <span className="font-semibold">ID:</span> <CopyableId id={user.id} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Store className="h-4 w-4 text-indigo-500 shrink-0" />
                                                    <span className="font-medium">{profile?.shopName || 'Chưa đặt tên'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 max-w-[200px]">
                                                    <div className="flex items-start gap-1">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                                        <span className="text-sm line-clamp-2" title={profile?.pickupAddress || 'Chưa cung cấp'}>
                                                            {profile?.pickupAddress || <span className="text-muted-foreground italic">Chưa cung cấp</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-mono">
                                                    {profile?.taxCode || <span className="text-muted-foreground italic">Trống</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(profile?.updatedAt || user.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                                        onClick={() => { setSelectedUser(user); setApproveDialogOpen(true); }}
                                                    >
                                                        <ShieldCheck className="h-4 w-4 mr-1" /> Duyệt
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => { setSelectedUser(user); setRejectDialogOpen(true); }}
                                                    >
                                                        <ShieldBan className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            {search ? 'Không tìm thấy yêu cầu nào phù hợp' : 'Không có yêu cầu đâng ký Seller nào đang chờ duyệt.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {!isLoading && meta.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Hiển thị {(page - 1) * limit + 1} - {Math.min(page * limit, meta.total)} / {meta.total} yêu cầu
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Trước
                                </Button>
                                <span className="flex items-center justify-center px-3 text-sm font-medium">
                                    Trang {page} / {meta.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                    disabled={page === meta.totalPages}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approve Confirm Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Phê duyệt người bán</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn phê duyệt cho thẻ <span className="font-semibold">{selectedUser?.username}</span> trở thành người bán với shop <span className="font-semibold">{(selectedUser?.sellerProfile as any)?.shopName}</span>?
                            <br /><br />
                            Sau khi duyệt, người dùng này sẽ có quyền truy cập vào Portal Người Bán và có thể đăng bán sản phẩm.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Hủy</Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => selectedUser && approveMutation.mutate(selectedUser.id)}
                            disabled={approveMutation.isPending}
                        >
                            {approveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            xác nhận Duyệt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Confirm Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối yêu cầu</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn từ chối yêu cầu đăng ký người bán của <span className="font-semibold">{selectedUser?.username}</span>?
                            Người dùng sẽ phải gửi lại đơn đăng ký mới nếu muốn trở thành người bán.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedUser && rejectMutation.mutate(selectedUser.id)}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Từ chối yêu cầu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
