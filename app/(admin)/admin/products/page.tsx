'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';
import { toast } from 'sonner';
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
    Loader2,
    Plus,
    Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PRODUCT_STATUS_CONFIG, formatCurrency, formatDate } from '@/lib/constants';
import type { Product, ProductStatus } from '@/types';
import { CopyableId } from '@/components/shared/CopyableId';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminProductsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        categoryId: '',
    });
    const [createImageFile, setCreateImageFile] = useState<File | null>(null);
    const [createImageUrl, setCreateImageUrl] = useState<string>('');
    const [editImageUrl, setEditImageUrl] = useState<string>('');

    // ─── Queries ─────────────────────────────────────────────────────────────
    const { data: productsData, isLoading, error } = useQuery({
        queryKey: ['products', { page, limit, search: debouncedSearch, status: statusFilter }],
        queryFn: () => productsService.getAll({
            page,
            limit,
            search: debouncedSearch || undefined,
            status: statusFilter,
            sortOrder: 'asc'
        }),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getAll,
    });

    // ─── Mutations ───────────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const payload: any = {
                name: data.name,
                description: data.description,
                price: data.price,
                stockQuantity: data.stockQuantity,
                categoryId: data.categoryId,
            };
            if (data.createImageUrl && !data.createImageFile) {
                payload.imageUrls = [data.createImageUrl];
            }

            const newProduct = await productsService.create(payload);

            if (data.createImageFile) {
                const fd = new FormData();
                fd.append('file', data.createImageFile);
                await productsService.uploadImage(newProduct.id, fd);
            }
            return newProduct;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setCreateDialogOpen(false);
            setFormData({ name: '', description: '', price: 0, stockQuantity: 0, categoryId: '' });
            setCreateImageFile(null);
            setCreateImageUrl('');
            toast.success('Đã tạo sản phẩm');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi tạo sản phẩm'),
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => productsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setEditDialogOpen(false);
            toast.success('Đã cập nhật sản phẩm');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật sản phẩm'),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string, status: ProductStatus }) => productsService.updateStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setDetailDialogOpen(false);
            toast.success('Đã cập nhật trạng thái sản phẩm');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật trạng thái'),
    });

    const deleteMutation = useMutation({
        mutationFn: productsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Đã xóa sản phẩm');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa sản phẩm'),
    });

    const uploadImageMutation = useMutation({
        mutationFn: ({ id, formData }: { id: string, formData: FormData }) => productsService.uploadImage(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // Update selected product locally so the UI updates without closing dialog
            productsService.getById(selectedProduct!.id).then(updated => {
                setSelectedProduct(updated);
            });
            toast.success('Đã tải ảnh lên');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi tải ảnh lên'),
    });

    const deleteImageMutation = useMutation({
        mutationFn: ({ id, imageId }: { id: string, imageId: number }) => productsService.deleteImage(id, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            productsService.getById(selectedProduct!.id).then(updated => {
                setSelectedProduct(updated);
            });
            toast.success('Đã xóa ảnh');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa ảnh'),
    });

    const addImageUrlMutation = useMutation({
        mutationFn: ({ id, imageUrl }: { id: string, imageUrl: string }) => productsService.addImageUrl(id, imageUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            productsService.getById(selectedProduct!.id).then(updated => {
                setSelectedProduct(updated);
            });
            toast.success('Đã thêm ảnh từ URL');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi thêm ảnh từ URL'),
    });

    const setPrimaryMutation = useMutation({
        mutationFn: ({ id, imageId }: { id: string, imageId: number }) => productsService.setPrimaryImage(id, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            productsService.getById(selectedProduct!.id).then(updated => {
                setSelectedProduct(updated);
            });
            toast.success('Đã đặt ảnh đại diện');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi đặt ảnh đại diện'),
    });

    // ─── Helpers ────────────────────────────────────────────────────────────
    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `/api/proxy${url}`;
    };

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleStatusChange = (product: Product, newStatus: ProductStatus) => {
        updateStatusMutation.mutate({ id: product.id, status: newStatus });
    };

    const handleDelete = (product: Product) => {
        if (confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
            deleteMutation.mutate(product.id);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedProduct) return;
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        uploadImageMutation.mutate({ id: selectedProduct.id, formData });

        // reset input
        e.target.value = '';
    };

    const handleDeleteImage = (imageId: number) => {
        if (!selectedProduct) return;
        if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
            deleteImageMutation.mutate({ id: selectedProduct.id, imageId });
        }
    };

    const handleCreate = () => {
        if (!formData.name.trim() || !formData.categoryId) {
            toast.error('Vui lòng nhập tên và chọn danh mục');
            return;
        }
        createMutation.mutate({
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            stockQuantity: Number(formData.stockQuantity),
            categoryId: Number(formData.categoryId),
            createImageFile,
            createImageUrl,
        });
    };

    const handleUpdate = () => {
        if (!selectedProduct) return;
        if (!formData.name.trim() || !formData.categoryId) {
            toast.error('Vui lòng nhập tên và chọn danh mục');
            return;
        }
        updateProductMutation.mutate({
            id: selectedProduct.id,
            data: {
                name: formData.name,
                description: formData.description || '',
                price: Number(formData.price),
                stockQuantity: Number(formData.stockQuantity),
                categoryId: Number(formData.categoryId),
            }
        });
    };

    const openEditDialog = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stockQuantity: product.stockQuantity,
            categoryId: product.categoryId.toString(),
        });
        setEditDialogOpen(true);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">({Number(rating).toFixed(1)})</span>
            </div>
        );
    };

    // ─── Derived Data ────────────────────────────────────────────────────────
    const products = productsData?.data || [];
    const totalProducts = productsData?.meta?.total || 0;
    const totalPages = productsData?.meta?.totalPages || 1;

    // Filter categories to only show ones that have no children (leaf categories) 
    // or just show all if hierarchy is too complex. Here we show all.
    const allCategories = [...categories].sort((a, b) => a.id - b.id);

    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center text-red-500 flex-col gap-4">
                <p>Đã xảy ra lỗi khi tải danh sách sản phẩm.</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>Thử lại</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                    <p className="text-muted-foreground mt-1">Duyệt, quản lý và kiểm soát sản phẩm trên hệ thống</p>
                </div>

                <Dialog open={createDialogOpen} onOpenChange={(open) => {
                    setCreateDialogOpen(open);
                    if (!open) setFormData({ name: '', description: '', price: 0, stockQuantity: 0, categoryId: '' });
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Thêm sản phẩm
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
                            <DialogDescription>Tạo sản phẩm mới trên hệ thống Admin.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Tên sản phẩm</Label>
                                <Input
                                    placeholder="Nhập tên..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Danh mục</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCategories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Giá (VNĐ)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tồn kho</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Mô tả (tùy chọn)</Label>
                                <Input
                                    placeholder="Mô tả sản phẩm..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ảnh sản phẩm (Tải lên hoặc dùng Link)</Label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="text-muted-foreground file:text-primary file:font-medium"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setCreateImageFile(e.target.files[0]);
                                                    setCreateImageUrl('');
                                                }
                                            }}
                                        />
                                    </div>
                                    {!createImageFile && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground w-12 text-center">Hoặc</span>
                                            <Input
                                                placeholder="Nhập URL ảnh (http://...)"
                                                value={createImageUrl}
                                                onChange={(e) => setCreateImageUrl(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {createImageFile && (
                                        <p className="text-xs text-emerald-600 truncate flex items-center">
                                            <span className="font-medium mr-1">Đã chọn file:</span> {createImageFile.name}
                                            <Button variant="link" size="sm" className="h-auto p-0 ml-2 text-red-500 h-4" onClick={() => setCreateImageFile(null)}>Bỏ chọn</Button>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo sản phẩm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên sản phẩm..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
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
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Không tìm thấy sản phẩm nào.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>ID</TableHead>
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
                                {products.map((product: Product, index: number) => (
                                    <TableRow key={product.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium text-muted-foreground">
                                            #{((page - 1) * limit) + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <CopyableId id={product.id} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-4 overflow-hidden py-1">
                                                    {product.images && product.images.length > 0 ? (
                                                        product.images.slice(0, 3).map((img, i) => (
                                                            <div
                                                                key={img.id}
                                                                className="inline-block h-14 w-14 rounded-lg ring-2 ring-background bg-muted shadow-sm overflow-hidden"
                                                                style={{ zIndex: 3 - i }}
                                                            >
                                                                <img
                                                                    src={getImageUrl(img.imageUrl)}
                                                                    alt={product.name}
                                                                    className="h-full w-full object-cover transition-transform hover:scale-110"
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    {product.images && product.images.length > 3 && (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg ring-2 ring-background bg-muted text-[10px] font-bold z-0">
                                                            +{product.images.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold max-w-[180px] truncate">{product.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">ID: {product.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{product.seller?.username || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">{product.category?.name || 'N/A'}</Badge>
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
                                                    <DropdownMenuItem onClick={() => openEditDialog(product)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Sửa thông tin
                                                    </DropdownMenuItem>
                                                    {product.status === 'PENDING' && (
                                                        <>
                                                            <DropdownMenuItem className="text-emerald-600" onClick={() => handleStatusChange(product, 'APPROVED')}>
                                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Duyệt sản phẩm
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(product, 'REJECTED')}>
                                                                <XCircle className="mr-2 h-4 w-4" /> Từ chối
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {product.status === 'APPROVED' && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(product, 'HIDDEN')}>
                                                            <EyeOff className="mr-2 h-4 w-4" /> Ẩn sản phẩm
                                                        </DropdownMenuItem>
                                                    )}
                                                    {(product.status === 'HIDDEN' || product.status === 'REJECTED') && (
                                                        <DropdownMenuItem className="text-emerald-600" onClick={() => handleStatusChange(product, 'APPROVED')}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Chấp thuận lại
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {!isLoading && products.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Hiển thị {products.length} / {totalProducts} sản phẩm
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    Trước
                                </Button>
                                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                                    {page}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
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
                                    <p className="font-medium">{selectedProduct.seller?.username}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Danh mục</p>
                                    <p className="font-medium">{selectedProduct.category?.name}</p>
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

                            <div className="space-y-2">
                                <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Hình ảnh ({selectedProduct.images?.length || 0})</Label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.images?.map((img) => (
                                        <div key={img.id} className={`relative h-24 w-24 rounded-lg overflow-hidden border-2 shadow-sm ${img.isPrimary ? 'border-amber-400' : 'border-transparent'}`}>
                                            <img
                                                src={getImageUrl(img.imageUrl)}
                                                alt="product"
                                                className="h-full w-full object-cover"
                                            />
                                            {img.isPrimary && (
                                                <div className="absolute top-0 right-0 bg-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded-bl-sm text-black uppercase">
                                                    Chính
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!selectedProduct.images || selectedProduct.images.length === 0) && (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-md bg-muted border border-dashed">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        {selectedProduct?.status === 'PENDING' && (
                            <>
                                <Button variant="destructive" onClick={() => { handleStatusChange(selectedProduct, 'REJECTED'); setDetailDialogOpen(false); }}>Từ chối</Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { handleStatusChange(selectedProduct, 'APPROVED'); setDetailDialogOpen(false); }}>Duyệt</Button>
                            </>
                        )}
                        <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sửa thông tin sản phẩm</DialogTitle>
                        <DialogDescription>Chỉnh sửa các trường cơ bản của sản phẩm</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên sản phẩm</Label>
                            <Input
                                placeholder="Nhập tên..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Danh mục</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Giá (VNĐ)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tồn kho</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Mô tả</Label>
                            <Input
                                placeholder="Mô tả sản phẩm..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Image Manager for Edit Mode */}
                        {selectedProduct && (
                            <div className="space-y-4 pt-4 border-t mt-4">
                                <Label>Quản lý ảnh ({selectedProduct.images?.length || 0})</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {selectedProduct.images?.map((img) => (
                                        <div key={img.id} className={`relative group rounded-lg overflow-hidden border-2 transition-all ${img.isPrimary ? 'border-amber-400 shadow-sm' : 'border-border'}`}>
                                            <img
                                                src={getImageUrl(img.imageUrl)}
                                                alt="product"
                                                className="w-full h-24 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                                                {!img.isPrimary && (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-7 w-full text-[10px] py-0 bg-white/90 hover:bg-white text-black"
                                                        onClick={() => setPrimaryMutation.mutate({ id: selectedProduct.id, imageId: Number(img.id) })}
                                                        disabled={setPrimaryMutation.isPending}
                                                    >
                                                        Đặt làm chính
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-7 w-full text-[10px] py-0"
                                                    onClick={() => handleDeleteImage(Number(img.id))}
                                                    disabled={deleteImageMutation.isPending}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" /> Xóa
                                                </Button>
                                            </div>
                                            {img.isPrimary && (
                                                <div className="absolute top-0 right-0 bg-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md text-black">
                                                    CHÍNH
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex bg-muted/50 items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted/80 transition-all h-24 group cursor-pointer">
                                        <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                                            {uploadImageMutation.isPending ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            ) : (
                                                <>
                                                    <Plus className="h-6 w-6 text-muted-foreground group-hover:scale-110 transition-transform mb-1" />
                                                    <span className="text-[10px] font-medium text-muted-foreground">Tải ảnh lên</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadImageMutation.isPending}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Dán link ảnh vào đây..."
                                        value={editImageUrl}
                                        onChange={(e) => setEditImageUrl(e.target.value)}
                                        className="text-xs h-8"
                                    />
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 shrink-0"
                                        onClick={() => {
                                            if (editImageUrl) {
                                                addImageUrlMutation.mutate({ id: selectedProduct.id, imageUrl: editImageUrl });
                                                setEditImageUrl('');
                                            }
                                        }}
                                        disabled={addImageUrlMutation.isPending || !editImageUrl}
                                    >
                                        {addImageUrlMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Thêm URL'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleUpdate} disabled={updateProductMutation.isPending}>
                            {updateProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
