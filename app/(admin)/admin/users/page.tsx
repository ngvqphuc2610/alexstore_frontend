'use client';

import { useState } from 'react';
import {
    Users,
    Search,
    MoreHorizontal,
    ShieldCheck,
    UserCog,
    Trash2,
    Eye,
    Filter,
    Plus,
    Loader2,
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
import type { User, Role } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { CopyableId } from '@/components/shared/CopyableId';

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        buyers: users.filter(u => u.role === 'BUYER').length,
        sellers: users.filter(u => u.role === 'SELLER').length,
        deleted: users.filter(u => u.isDeleted).length
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
            <div className="grid gap-4 md:grid-cols-4">
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
                        <div className="text-2xl font-bold text-red-600">{isLoading ? <Skeleton className="h-8 w-12" /> : stats.deleted}</div>
                        <p className="text-xs text-muted-foreground">Đã vô hiệu hóa</p>
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
                                    <TableHead>Xác thực</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user, index) => (
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
                                            {user.role === 'SELLER' && (
                                                user.sellerProfile?.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                                        <ShieldCheck className="h-4 w-4" /> Đã xác thực
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-600">Chờ xác thực</span>
                                                )
                                            )}
                                            {user.role !== 'SELLER' && <span className="text-xs text-muted-foreground">—</span>}
                                        </TableCell>
                                        <TableCell>
                                            {user.isDeleted ? (
                                                <Badge variant="destructive" className="text-xs">Đã khóa</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
                                            )}
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
                                                            shopName: user.sellerProfile?.shopName || ''
                                                        });
                                                        setEditDialogOpen(true);
                                                    }}>
                                                        <UserCog className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}
                                                        disabled={user.isDeleted}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Xóa tài khoản
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
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

            {/* Delete Confirm Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận vô hiệu hóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn vô hiệu hóa tài khoản <span className="font-semibold">{selectedUser?.username}</span>? Tài khoản sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
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
                            Vô hiệu hóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
