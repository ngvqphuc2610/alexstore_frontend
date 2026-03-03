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
} from 'lucide-react';
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
import type { Role } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockUsers = [
    { id: '1', username: 'admin_master', email: 'admin@alexstore.com', role: 'ADMIN' as Role, isSellerVerified: false, isDeleted: false, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    { id: '2', username: 'techworld_shop', email: 'tech@email.com', role: 'SELLER' as Role, isSellerVerified: true, isDeleted: false, createdAt: '2026-02-15T10:30:00Z', updatedAt: '2026-02-20T08:00:00Z' },
];

export default function AdminUsersPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

    const filteredUsers = mockUsers.filter((user) => {
        const matchesSearch =
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                <p className="text-muted-foreground mt-1">Quản lý tài khoản, vai trò và quyền hạn người dùng</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{mockUsers.length}</div>
                        <p className="text-xs text-muted-foreground">Tổng người dùng</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">{mockUsers.filter(u => u.role === 'BUYER').length}</div>
                        <p className="text-xs text-muted-foreground">Người mua</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">{mockUsers.filter(u => u.role === 'SELLER').length}</div>
                        <p className="text-xs text-muted-foreground">Người bán</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{mockUsers.filter(u => u.isDeleted).length}</div>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
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
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50">
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
                                            user.isSellerVerified ? (
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
                                            <Badge variant="destructive" className="text-xs">Đã xóa</Badge>
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
                                                <DropdownMenuItem onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}>
                                                    <UserCog className="mr-2 h-4 w-4" /> Sửa vai trò
                                                </DropdownMenuItem>
                                                {user.role === 'SELLER' && !user.isSellerVerified && (
                                                    <DropdownMenuItem className="text-emerald-600">
                                                        <ShieldCheck className="mr-2 h-4 w-4" /> Xác thực seller
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => { setSelectedUser(user); setDeleteDialogOpen(true); }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa tài khoản
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination placeholder */}
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Hiển thị {filteredUsers.length} / {mockUsers.length} người dùng
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Trước</Button>
                            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                            <Button variant="outline" size="sm" disabled>Sau</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Role Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sửa vai trò người dùng</DialogTitle>
                        <DialogDescription>
                            Thay đổi vai trò cho <span className="font-semibold">{selectedUser?.username}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <Select defaultValue={selectedUser?.role}>
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
                        <Button onClick={() => setEditDialogOpen(false)}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa tài khoản <span className="font-semibold">{selectedUser?.username}</span>? Hành động này sẽ đánh dấu tài khoản là đã xóa (soft delete).
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>Xóa tài khoản</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
