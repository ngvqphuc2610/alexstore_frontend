'use client';

import { useState } from 'react';
import {
    FolderTree,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    ChevronRight,
    FolderPlus,
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

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockCategories = [
    { id: 1, name: 'Điện thoại', parentId: null, productCount: 2 },
    { id: 2, name: 'iPhone', parentId: 1, productCount: 1 },
    { id: 3, name: 'Laptop', parentId: null, productCount: 1 },
    { id: 4, name: 'MacBook', parentId: 3, productCount: 1 },
];

export default function AdminCategoriesPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<typeof mockCategories[0] | null>(null);

    const rootCategories = mockCategories.filter((c) => c.parentId === null);
    const getChildren = (parentId: number) => mockCategories.filter((c) => c.parentId === parentId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý danh mục</h1>
                    <p className="text-muted-foreground mt-1">Tổ chức và phân loại sản phẩm theo danh mục</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                                <Input placeholder="Nhập tên danh mục..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Danh mục cha (tùy chọn)</Label>
                                <Select>
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
                            <Button onClick={() => setCreateDialogOpen(false)}>Tạo danh mục</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{mockCategories.length}</div>
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
                        <div className="text-2xl font-bold text-emerald-600">{mockCategories.filter(c => c.parentId !== null).length}</div>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[400px]">Tên danh mục</TableHead>
                                <TableHead>Danh mục cha</TableHead>
                                <TableHead>Số sản phẩm</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rootCategories.map((rootCat) => {
                                const children = getChildren(rootCat.id);
                                return (
                                    <>
                                        {/* Root category row */}
                                        <TableRow key={rootCat.id} className="hover:bg-muted/50 bg-muted/20">
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
                                                <Badge variant="outline">{rootCat.productCount}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedCategory(rootCat); setEditDialogOpen(true); }}>
                                                            <Edit className="mr-2 h-4 w-4" /> Sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
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
                                        {children.map((child) => (
                                            <TableRow key={child.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-2 pl-8">
                                                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                        <span>{child.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{rootCat.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{child.productCount}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { setSelectedCategory(child); setEditDialogOpen(true); }}>
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
                                    </>
                                );
                            })}
                        </TableBody>
                    </Table>
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
                            <Input defaultValue={selectedCategory?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Danh mục cha</Label>
                            <Select defaultValue={selectedCategory?.parentId?.toString() || 'none'}>
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
                        <Button onClick={() => setEditDialogOpen(false)}>Lưu</Button>
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
                            {selectedCategory && selectedCategory.productCount > 0 && (
                                <span className="block mt-1 text-red-600 font-medium">
                                    ⚠️ Danh mục này có {selectedCategory.productCount} sản phẩm liên quan.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>Xóa danh mục</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
