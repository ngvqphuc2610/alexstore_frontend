'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Edit, Trash2, Star, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
import { CategoryDropdown } from '@/components/seller/CategoryDropdown';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const productSchema = z.object({
    name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
    description: z.string().default(''),
    categoryId: z.coerce.number().int().positive('Vui lòng chọn danh mục'),
    price: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
    stockQuantity: z.coerce.number().int().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface EditProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: any;
}

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: '',
            description: '',
            categoryId: undefined as any,
            price: 0,
            stockQuantity: 0,
        },
    });

    // Re-populate form when product changes
    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name || '',
                description: product.description || '',
                categoryId: product.categoryId || 0,
                price: product.price || 0,
                stockQuantity: product.stockQuantity || 0,
            });
        }
    }, [product, form]);

    // Refetch product detail for images
    const { data: productDetail } = useQuery({
        queryKey: ['product-detail', product?.id],
        queryFn: async () => {
            const res = await fetch(`/api/proxy/products/${product.id}`);
            if (!res.ok) throw new Error('Failed to fetch product detail');
            return res.json();
        },
        enabled: !!product?.id && open,
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/proxy/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: ProductFormValues) => {
            const res = await fetch(`/api/proxy/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Không thể cập nhật sản phẩm');
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success('Đã cập nhật sản phẩm thành công!');
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
            queryClient.invalidateQueries({ queryKey: ['product-detail', product?.id] });
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra khi cập nhật');
        },
    });

    const deleteImageMutation = useMutation({
        mutationFn: async (imageId: number) => {
            const res = await fetch(`/api/proxy/products/${product.id}/images/${imageId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Không thể xóa ảnh');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Đã xóa ảnh');
            queryClient.invalidateQueries({ queryKey: ['product-detail', product?.id] });
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra khi xóa ảnh');
        },
    });

    const setPrimaryMutation = useMutation({
        mutationFn: async (imageId: number) => {
            const res = await fetch(`/api/proxy/products/${product.id}/images/${imageId}/primary`, {
                method: 'PATCH',
            });
            if (!res.ok) throw new Error('Không thể đặt ảnh đại diện');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Đã đặt ảnh đại diện');
            queryClient.invalidateQueries({ queryKey: ['product-detail', product?.id] });
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra');
        },
    });

    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/proxy/products/${product.id}/images`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            toast.success('Đã upload ảnh thành công');
            queryClient.invalidateQueries({ queryKey: ['product-detail', product?.id] });
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
        } catch (err: any) {
            toast.error(err.message || 'Lỗi khi upload ảnh');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onSubmit = (values: ProductFormValues) => {
        updateMutation.mutate(values);
    };

    const images = productDetail?.images || product?.images || [];
    const categoriesList = Array.isArray(categories) ? categories : categories?.data ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-emerald-600" />
                        Chỉnh sửa sản phẩm
                    </DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin và hình ảnh cho sản phẩm "{product?.name}".
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên sản phẩm <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: iPhone 15 Pro Max 256GB" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả sản phẩm</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mô tả chi tiết về sản phẩm..."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Danh mục <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <CategoryDropdown
                                            categories={categoriesList}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giá bán (₫) <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="stockQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số lượng kho <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} step={1} placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* Image Management */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900">Hình ảnh sản phẩm</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    Upload ảnh
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleUploadImage}
                                />
                            </div>

                            {images.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">Chưa có ảnh nào</p>
                                    <p className="text-xs text-gray-400 mt-1">Nhấn "Upload ảnh" để thêm</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((img: any) => (
                                        <div
                                            key={img.id}
                                            className="group relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 aspect-square"
                                        >
                                            <img
                                                src={getImageUrl(img.imageUrl)}
                                                alt="Product"
                                                className="w-full h-full object-cover"
                                            />
                                            {img.isPrimary && (
                                                <Badge className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">
                                                    <Star className="h-2.5 w-2.5 mr-0.5" />
                                                    Đại diện
                                                </Badge>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                {!img.isPrimary && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-8 text-xs"
                                                        onClick={() => setPrimaryMutation.mutate(img.id)}
                                                        disabled={setPrimaryMutation.isPending}
                                                    >
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Đặt chính
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-8 text-xs"
                                                    onClick={() => deleteImageMutation.mutate(img.id)}
                                                    disabled={deleteImageMutation.isPending}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu thay đổi
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
