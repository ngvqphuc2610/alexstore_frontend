'use client';

import { useState } from 'react';
import {
    Package,
    Search,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    EyeOff,
    Eye,
    Trash2,
    Filter,
    Star,
    ImageIcon,
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
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PRODUCT_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/constants';
import type { ProductStatus } from '@/types';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockProducts = [
    { id: '1', name: 'iPhone 16 Pro Max 256GB', seller: 'TechWorld Store', category: 'Điện thoại', price: 34990000, stockQuantity: 50, avgRating: 4.8, reviewCount: 128, status: 'APPROVED' as ProductStatus, createdAt: '2026-02-01T10:00:00Z' },
    { id: '2', name: 'Samsung Galaxy S25 Ultra', seller: 'Mobile Paradise', category: 'Điện thoại', price: 31990000, stockQuantity: 5, avgRating: 0, reviewCount: 0, status: 'PENDING' as ProductStatus, createdAt: '2026-03-02T14:30:00Z' },
];

export default function AdminProductsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);

    const filteredProducts = mockProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">({rating})</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                <p className="text-muted-foreground mt-1">Duyệt, quản lý và kiểm soát sản phẩm trên hệ thống</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{mockProducts.length}</div>
                        <p className="text-xs text-muted-foreground">Tổng sản phẩm</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm border-l-4 border-l-yellow-400">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{mockProducts.filter(p => p.status === 'PENDING').length}</div>
                        <p className="text-xs text-muted-foreground">Chờ duyệt</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-600">{mockProducts.filter(p => p.status === 'APPROVED').length}</div>
                        <p className="text-xs text-muted-foreground">Đã duyệt</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{mockProducts.filter(p => p.status === 'REJECTED').length}</div>
                        <p className="text-xs text-muted-foreground">Từ chối</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Tìm theo tên sản phẩm..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Lọc trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                <SelectItem value="REJECTED">Từ chối</SelectItem>
                                <SelectItem value="HIDDEN">Ẩn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead>Người bán</TableHead>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Giá</TableHead>
                                <TableHead>Tồn kho</TableHead>
                                <TableHead>Đánh giá</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <TableRow key={product.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <span className="font-medium max-w-[200px] truncate">{product.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{product.seller}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(product.price)}</TableCell>
                                    <TableCell>
                                        <span className={product.stockQuantity < 10 ? 'text-red-600 font-semibold' : ''}>
                                            {product.stockQuantity}
                                            {product.stockQuantity === 0 && <span className="ml-1 text-xs">(Hết)</span>}
                                        </span>
                                    </TableCell>
                                    <TableCell>{renderStars(product.avgRating)}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={product.status} configMap={PRODUCT_STATUS_CONFIG} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => { setSelectedProduct(product); setDetailDialogOpen(true); }}>
                                                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                </DropdownMenuItem>
                                                {product.status === 'PENDING' && (
                                                    <>
                                                        <DropdownMenuItem className="text-emerald-600">
                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt sản phẩm
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600">
                                                            <XCircle className="mr-2 h-4 w-4" /> Từ chối
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {product.status === 'APPROVED' && (
                                                    <DropdownMenuItem>
                                                        <EyeOff className="mr-2 h-4 w-4" /> Ẩn sản phẩm
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
                            Hiển thị {filteredProducts.length} / {mockProducts.length} sản phẩm
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
                        <DialogTitle>Chi tiết sản phẩm</DialogTitle>
                    </DialogHeader>
                    {selectedProduct && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Tên sản phẩm</p>
                                    <p className="font-medium">{selectedProduct.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Người bán</p>
                                    <p className="font-medium">{selectedProduct.seller}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Danh mục</p>
                                    <p className="font-medium">{selectedProduct.category}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Giá</p>
                                    <p className="font-medium text-emerald-600">{formatCurrency(selectedProduct.price)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tồn kho</p>
                                    <p className="font-medium">{selectedProduct.stockQuantity}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Trạng thái</p>
                                    <StatusBadge status={selectedProduct.status} configMap={PRODUCT_STATUS_CONFIG} />
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Đánh giá</p>
                                    {renderStars(selectedProduct.avgRating)}
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Lượt đánh giá</p>
                                    <p className="font-medium">{selectedProduct.reviewCount}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedProduct?.status === 'PENDING' && (
                            <>
                                <Button variant="destructive" onClick={() => setDetailDialogOpen(false)}>Từ chối</Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setDetailDialogOpen(false)}>Duyệt</Button>
                            </>
                        )}
                        <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
