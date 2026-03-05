'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { toast } from 'sonner';
import type { Category } from '@/types';
import {
    FolderTree,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    ChevronRight,
    FolderPlus,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', parentId: 'none' });

    // ─── Queries & Mutations ──────────────────────────────────────────────────
    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: categoriesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setCreateDialogOpen(false);
            setFormData({ name: '', parentId: 'none' });
            toast.success('Đã tạo danh mục mới');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi tạo danh mục'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => categoriesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setEditDialogOpen(false);
            toast.success('Đã cập nhật danh mục');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật danh mục'),
    });

    const deleteMutation = useMutation({
        mutationFn: categoriesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setDeleteDialogOpen(false);
            toast.success('Đã xóa danh mục');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa danh mục'),
    });

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleCreate = () => {
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return;
        }
        createMutation.mutate({
            name: formData.name,
            parentId: formData.parentId === 'none' ? null : Number(formData.parentId)
        });
    };

    const handleUpdate = () => {
        if (!selectedCategory) return;
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return;
        }

        // Prevent setting a category as its own parent
        const newParentId = formData.parentId === 'none' ? null : Number(formData.parentId);
        if (newParentId === selectedCategory.id) {
            toast.error('Không thể chọn danh mục này làm danh mục cha của chính nó');
            return;
        }

        updateMutation.mutate({
            id: selectedCategory.id,
            data: {
                name: formData.name,
                parentId: newParentId
            }
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) return;
        deleteMutation.mutate(selectedCategory.id);
    };

    const openEditDialog = (cat: Category) => {
        setSelectedCategory(cat);
        setFormData({
            name: cat.name,
            parentId: cat.parentId ? cat.parentId.toString() : 'none'
        });
        setEditDialogOpen(true);
    };

    const openCreateChildDialog = (parentCat: Category) => {
        setFormData({ name: '', parentId: parentCat.id.toString() });
        setCreateDialogOpen(true);
    };

    // ─── Derived Data ────────────────────────────────────────────────────────
    const sortedCategories = [...categories].sort((a, b) => a.id - b.id);
    const rootCategories = sortedCategories.filter((c) => c.parentId === null);
    const getChildren = (parentId: number) => sortedCategories.filter((c) => c.parentId === parentId);

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center text-red-500 flex-col gap-4">
                <p>Đã xảy ra lỗi khi tải danh mục.</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}>Thử lại</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý danh mục</h1>
                    <p className="text-muted-foreground mt-1">Tổ chức và phân loại sản phẩm theo danh mục</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={(open) => {
                    setCreateDialogOpen(open);
                    if (!open) setFormData({ name: '', parentId: 'none' });
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Thêm danh mục
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm danh mục mới</DialogTitle>
                            <DialogDescription>Tạo danh mục mới để phân loại sản phẩm</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tên danh mục</Label>
                                <Input
                                    placeholder="Nhập tên danh mục..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Danh mục cha (tùy chọn)</Label>
                                <Select
                                    value={formData.parentId}
                                    onValueChange={(val) => setFormData({ ...formData, parentId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục cha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Không có (danh mục gốc) —</SelectItem>
                                        {rootCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo danh mục
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{categories.length}</div>
                        <p className="text-xs text-muted-foreground">Tổng danh mục</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-indigo-600">{rootCategories.length}</div>
                        <p className="text-xs text-muted-foreground">Danh mục gốc</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-600">{categories.filter(c => c.parentId !== null).length}</div>
                        <p className="text-xs text-muted-foreground">Danh mục con</p>
                    </CardContent>
                </Card>
            </div>

            {/* Categories Table */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>Cây danh mục</CardTitle>
                    <CardDescription>Danh mục được tổ chức theo cấp bậc cha/con</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Không có danh mục nào. Hãy tạo mới danh mục.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead className="w-[300px]">Tên danh mục</TableHead>
                                    <TableHead>Danh mục cha</TableHead>
                                    <TableHead>Số sản phẩm</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rootCategories.map((rootCat, index) => {
                                    const children = getChildren(rootCat.id);
                                    return (
                                        <React.Fragment key={rootCat.id}>
                                            {/* Root category row */}
                                            <TableRow className="hover:bg-muted/50 bg-muted/20">
                                                <TableCell className="font-medium text-muted-foreground">
                                                    #{index + 1}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {rootCat.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FolderTree className="h-4 w-4 text-indigo-500" />
                                                        <span className="font-semibold">{rootCat.name}</span>
                                                        {children.length > 0 && (
                                                            <Badge variant="secondary" className="text-xs">{children.length} con</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">—</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{rootCat._count?.products || 0}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEditDialog(rootCat)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Sửa
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openCreateChildDialog(rootCat)}>
                                                                <FolderPlus className="mr-2 h-4 w-4" /> Thêm danh mục con
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedCategory(rootCat); setDeleteDialogOpen(true); }}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            {/* Children rows */}
                                            {children.map((child, childIdx) => (
                                                <TableRow key={child.id} className="hover:bg-muted/50">
                                                    <TableCell className="text-xs text-muted-foreground pl-6">
                                                        {index + 1}.{childIdx + 1}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-xs">
                                                        {child.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 pl-4">
                                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                            <span>{child.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{rootCat.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{child._count?.products || 0}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openEditDialog(child)}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Sửa
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedCategory(child); setDeleteDialogOpen(true); }}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sửa danh mục</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên danh mục</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Danh mục cha</Label>
                            <Select
                                value={formData.parentId}
                                onValueChange={(val) => setFormData({ ...formData, parentId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">— Không có —</SelectItem>
                                    {rootCategories.filter(c => c.id !== selectedCategory?.id).map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa danh mục</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa danh mục <span className="font-semibold">&quot;{selectedCategory?.name}&quot;</span>?
                            {selectedCategory && getChildren(selectedCategory.id).length > 0 && (
                                <span className="block mt-2 text-amber-600 font-medium">
                                    ⚠️ Danh mục này có {getChildren(selectedCategory.id).length} danh mục con. Các danh mục con sẽ trở thành danh mục gốc.
                                </span>
                            )}
                            {selectedCategory && (selectedCategory._count?.products ?? 0) > 0 && (
                                <span className="block mt-1 text-red-600 font-medium">
                                    ⚠️ Danh mục này có {selectedCategory._count?.products ?? 0} sản phẩm liên quan. Vui lòng chuyển các sản phẩm này sang danh mục khác trước khi xóa.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa danh mục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
