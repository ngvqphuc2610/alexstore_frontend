'use client';

import React, { useState } from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Loader2,
    Image as ImageIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
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
import { AddProductDialog } from '@/components/seller/AddProductDialog';
import { EditProductDialog } from '@/components/seller/EditProductDialog';

export default function SellerProductsPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['seller-products', user?.id],
        queryFn: async () => {
            const res = await fetch(`/api/proxy/products?sellerId=${user?.id}&status=all&limit=100`);
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
        enabled: !!user?.id,
    });

    const deleteMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetch(`/api/proxy/products/${productId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Không thể xóa sản phẩm');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Đã xóa sản phẩm thành công');
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Đang bán</Badge>;
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Đang chờ duyệt</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Từ chối</Badge>;
            case 'HIDDEN':
                return <Badge variant="secondary">Đã ẩn</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const products = productsData?.data ?? productsData ?? [];
    const productsList = Array.isArray(products) ? products : (products as any)?.data ?? [];
    const filteredProducts = productsList.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sản phẩm của tôi</h1>
                    <p className="text-gray-500 text-sm">Quản lý và cập nhật danh sách sản phẩm của gian hàng.</p>
                </div>
                <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setIsAddOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm sản phẩm mới
                </Button>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm sản phẩm..."
                                className="pl-10 h-10 border-emerald-100 focus:border-emerald-300 focus:ring-emerald-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-10 border-emerald-100 text-emerald-700">
                                <Filter className="h-4 w-4 mr-2" />
                                Bộ lọc
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 opacity-20" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                <Package className="h-8 w-8 text-emerald-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                {searchTerm ? 'Thử tìm kiếm với từ khóa khác.' : 'Bắt đầu bán hàng bằng cách thêm sản phẩm đầu tiên.'}
                            </p>
                            {!searchTerm && (
                                <Button
                                    className="mt-6 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => setIsAddOpen(true)}
                                >
                                    Thêm sản phẩm
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-16">Ảnh</TableHead>
                                        <TableHead>Tên sản phẩm</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Giá bán</TableHead>
                                        <TableHead>Kho</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((p: any) => (
                                        <TableRow key={p.id} className="hover:bg-emerald-50/10">
                                            <TableCell>
                                                <div className="h-12 w-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                                    {p.images && p.images.length > 0 ? (
                                                        <img
                                                            src={getImageUrl(p.images[0].imageUrl)}
                                                            alt={p.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900 max-w-[250px] truncate">
                                                {p.name}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(p.status)}
                                            </TableCell>
                                            <TableCell className="font-bold text-emerald-700">
                                                {Number(p.price).toLocaleString('vi-VN')}₫
                                            </TableCell>
                                            <TableCell>
                                                <span className={p.stockQuantity <= 5 ? 'text-red-500 font-bold' : 'text-gray-600'}>
                                                    {p.stockQuantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer"
                                                            onClick={() => setEditProduct(p)}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" /> Sửa thông tin
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                                                            onClick={() => {
                                                                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                                                                    deleteMutation.mutate(p.id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Xóa sản phẩm
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <AddProductDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
            {editProduct && (
                <EditProductDialog
                    open={!!editProduct}
                    onOpenChange={(open) => { if (!open) setEditProduct(null); }}
                    product={editProduct}
                />
            )}
        </div>
    );
}
