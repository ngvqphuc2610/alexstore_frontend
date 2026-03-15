'use client';

import { useState } from 'react';
import {
    Users,
    Search,
    MoreHorizontal,
    ShieldCheck,
    ShieldBan,
    ShieldAlert,
    UserCog,
    Trash2,
    Eye,
    Filter,
    Plus,
    Loader2,
    CheckCircle2,
    XCircle,
    Ban,
    Unlock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { ROLE_CONFIG, formatDate } from '@/lib/constants';
import type { User, Role, UserStatus, SellerVerificationStatus } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { CopyableId } from '@/components/shared/CopyableId';

// ─── Status Config ─────────────────────────────────────────────────────────
const USER_STATUS_CONFIG: Record<UserStatus, { label: string; color: string; icon: React.ReactNode }> = {
    ACTIVE: { label: 'Hoạt động', color: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    BANNED: { label: 'Bị khóa', color: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <Ban className="h-3.5 w-3.5" /> },
    DELETED: { label: 'Đã xóa', color: 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-400', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const VERIFICATION_STATUS_CONFIG: Record<SellerVerificationStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Chờ duyệt', color: 'text-amber-600', icon: <ShieldAlert className="h-4 w-4" /> },
    APPROVED: { label: 'Đã duyệt', color: 'text-emerald-600', icon: <ShieldCheck className="h-4 w-4" /> },
    REJECTED: { label: 'Bị từ chối', color: 'text-red-600', icon: <ShieldBan className="h-4 w-4" /> },
};

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form states for Create/Edit
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'BUYER' as Role,
        shopName: '',
    });

    // ─── Queries ─────────────────────────────────────────────────────────────
    const { data: users = [], isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: userService.getAllUsers,
        select: (data: any) => Array.isArray(data) ? data : (data?.data ?? []),
    });

    // ─── Mutations ───────────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: userService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setCreateDialogOpen(false);
            resetForm();
            toast.success('Đã tạo người dùng mới');
        },
        onError: (error: any) => toast.error(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => userService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditDialogOpen(false);
            toast.success('Đã cập nhật thông tin');
        },
        onError: (error: any) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: userService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeleteDialogOpen(false);
            toast.success('Đã vô hiệu hóa tài khoản');
        },
        onError: (error: any) => toast.error(error.message),
    });

    const banMutation = useMutation({
        mutationFn: userService.banUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setBanDialogOpen(false);
            toast.success('Đã khóa tài khoản');
        },
        onError: (error: any) => toast.error(error.message),
    });

    const unbanMutation = useMutation({
        mutationFn: userService.unbanUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Đã mở khóa tài khoản');
        },
        onError: (error: any) => toast.error(error.message),
    });

    const approveMutation = useMutation({
        mutationFn: userService.approveSeller,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Đã duyệt người bán');
        },
        onError: (error: any) => toast.error(error.message),
    });

    const rejectMutation = useMutation({
        mutationFn: userService.rejectSeller,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Đã từ chối người bán');
        },
        onError: (error: any) => toast.error(error.message),
    });

    // ─── Handlers ────────────────────────────────────────────────────────────
    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            role: 'BUYER',
            shopName: '',
        });
    };

    const handleCreate = () => {
        createMutation.mutate(formData);
    };

    const handleUpdate = () => {
        if (!selectedUser) return;
        updateMutation.mutate({
            id: selectedUser.id,
            data: {
                username: formData.username,
                email: formData.email,
                role: formData.role,
            }
        });
    };

    const sortedUsers = [...users].sort((a, b) => a.id.localeCompare(b.id));

    const filteredUsers = sortedUsers.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const stats = {
        total: users.length,
        buyers: users.filter((u: User) => u.role === 'BUYER').length,
        sellers: users.filter((u: User) => u.role === 'SELLER').length,
        admins: users.filter((u: User) => u.role === 'ADMIN').length,
        banned: users.filter((u: User) => u.status === 'BANNED').length,
    };

    /**
     * Determines the seller verification status for a given user.
     * Note: A user with role BUYER might have a pending seller application.
     */
    const getVerificationStatus = (user: User): SellerVerificationStatus | null => {
        if (!user.sellerProfile) return null;
        return user.sellerProfile.verificationStatus as SellerVerificationStatus;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-1">Quản lý tài khoản, vai trò và quyền hạn người dùng</p>
                </div>
                <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.total}</div>
                        <p className="text-xs text-muted-foreground">Tổng người dùng</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.buyers}</div>
                        <p className="text-xs text-muted-foreground">Người mua</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.sellers}</div>
                        <p className="text-xs text-muted-foreground">Người bán</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-violet-600">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.admins}</div>
                        <p className="text-xs text-muted-foreground">Quản trị viên</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.banned}</div>
                        <p className="text-xs text-muted-foreground">Bị khóa</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên, email..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Lọc theo vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả vai trò</SelectItem>
                                <SelectItem value="BUYER">Người mua</SelectItem>
                                <SelectItem value="SELLER">Người bán</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Lọc theo trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                <SelectItem value="BANNED">Bị khóa</SelectItem>
                                <SelectItem value="DELETED">Đã xóa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : isError ? (
                        <div className="py-10 text-center text-red-500">
                            Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>UUID</TableHead>
                                    <TableHead>Người dùng</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Vai trò</TableHead>
                                    <TableHead>Xác thực Seller</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user, index) => {
                                    const vStatus = getVerificationStatus(user);
                                    const vConfig = vStatus ? VERIFICATION_STATUS_CONFIG[vStatus] : null;
                                    const sConfig = USER_STATUS_CONFIG[(user.status as UserStatus)] ?? USER_STATUS_CONFIG.ACTIVE;
                                    const verificationStatus = getVerificationStatus(user); // Re-using for the new dropdown logic

                                    return (
                                        <TableRow key={user.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-muted-foreground">
                                                #{index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <CopyableId id={user.id} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                                                        {user.username.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{user.username}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={user.role} configMap={ROLE_CONFIG} />
                                            </TableCell>
                                            <TableCell>
                                                {vConfig ? (
                                                    <span className={`inline-flex items-center gap-1 text-xs ${vConfig.color}`}>
                                                        {vConfig.icon} {vConfig.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-xs inline-flex items-center gap-1 ${sConfig.color}`}>
                                                    {sConfig.icon} {sConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedUser(user);
                                                            setFormData({
                                                                username: user.username,
                                                                email: user.email,
                                                                password: '',
                                                                role: user.role,
                                                                shopName: (user.sellerProfile as any)?.shopName || ''
                                                            });
                                                            setEditDialogOpen(true);
                                                        }}>
                                                            <UserCog className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        {/* Ban / Unban */}
                                                        {user.status === 'ACTIVE' && user.role !== 'ADMIN' && (
                                                            <DropdownMenuItem
                                                                className="text-orange-600"
                                                                onClick={() => { setSelectedUser(user); setBanDialogOpen(true); }}
                                                            >
                                                                <Ban className="mr-2 h-4 w-4" /> Khóa tài khoản
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.status === 'BANNED' && (
                                                            <DropdownMenuItem
                                                                className="text-emerald-600"
                                                                onClick={() => unbanMutation.mutate(user.id)}
                                                                disabled={unbanMutation.isPending}
                                                            >
                                                                <Unlock className="mr-2 h-4 w-4" /> Mở khóa
                                                            </DropdownMenuItem>
                                                        )}

                                                        {/* Seller Verification */}
                                                        {verificationStatus === 'PENDING' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="text-emerald-600"
                                                                    onClick={() => approveMutation.mutate(user.id)}
                                                                    disabled={approveMutation.isPending}
                                                                >
                                                                    <ShieldCheck className="mr-2 h-4 w-4" /> Duyệt Seller
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => rejectMutation.mutate(user.id)}
                                                                    disabled={rejectMutation.isPending}
                                                                >
                                                                    <ShieldBan className="mr-2 h-4 w-4" /> Từ chối Seller
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}
                                                            disabled={user.isDeleted || user.status === 'DELETED'}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Xóa tài khoản
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center">
                                            Không tìm thấy người dùng nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Hiển thị {filteredUsers.length} / {users.length} người dùng
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Create User Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Thêm người dùng mới</DialogTitle>
                        <DialogDescription>
                            Tạo tài khoản người dùng mới thủ công.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Tên người dùng</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Vai trò</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val as Role })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BUYER">Người mua</SelectItem>
                                    <SelectItem value="SELLER">Người bán</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.role === 'SELLER' && (
                            <div className="grid gap-2">
                                <Label htmlFor="shopName">Tên cửa hàng</Label>
                                <Input
                                    id="shopName"
                                    value={formData.shopName}
                                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tạo người dùng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin cho <span className="font-semibold">{selectedUser?.username}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-username">Tên người dùng</Label>
                            <Input
                                id="edit-username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Vai trò</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val as Role })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BUYER">Người mua</SelectItem>
                                    <SelectItem value="SELLER">Người bán</SelectItem>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ban Confirm Dialog */}
            <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận khóa tài khoản</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn khóa tài khoản <span className="font-semibold">{selectedUser?.username}</span>?
                            Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Hủy</Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedUser && banMutation.mutate(selectedUser.id)}
                            disabled={banMutation.isPending}
                        >
                            {banMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Khóa tài khoản
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa tài khoản <span className="font-semibold">{selectedUser?.username}</span>? Tài khoản sẽ bị vô hiệu hóa vĩnh viễn.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa tài khoản
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
