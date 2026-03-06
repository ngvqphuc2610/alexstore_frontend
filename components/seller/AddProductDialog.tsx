'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

const productSchema = z.object({
    name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
    description: z.string().default(''),
    categoryId: z.coerce.number().int().positive('Vui lòng chọn danh mục'),
    price: z.coerce.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
    stockQuantity: z.coerce.number().int().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface AddProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for images before upload
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/proxy/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
    });

    const categoriesList = Array.isArray(categories) ? categories : categories?.data ?? [];

    // --- Image Handlers ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Add to selected files
        setSelectedFiles(prev => [...prev, ...files]);

        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            const newUrls = [...prev];
            URL.revokeObjectURL(newUrls[index]);
            newUrls.splice(index, 1);
            return newUrls;
        });
    };

    // --- Submit Logic ---
    const onSubmit = async (values: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            // 1. Create Product
            const res = await fetch('/api/proxy/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Không thể tạo sản phẩm');
            }

            const result = await res.json();
            const newProduct = result.data || result; // unwrap ResponseInterceptor wrapper

            // 2. Upload Images sequentially
            if (selectedFiles.length > 0) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const formData = new FormData();
                    formData.append('file', file);

                    await fetch(`/api/proxy/products/${newProduct.id}/images`, {
                        method: 'POST',
                        body: formData,
                    });
                }
            }

            toast.success('Đã tạo sản phẩm mới thành công!');

            // Clean up
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setSelectedFiles([]);
            setPreviewUrls([]);
            form.reset();

            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
            onOpenChange(false);

        } catch (err: any) {
            toast.error(err.message || 'Có lỗi xảy ra khi tạo sản phẩm');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-emerald-600" />
                        Thêm sản phẩm mới
                    </DialogTitle>
                    <DialogDescription>
                        Điền thông tin và hình ảnh sản phẩm để đăng bán trên gian hàng của bạn.
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

                        {/* Image Upload Area */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Hình ảnh sản phẩm</h4>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isSubmitting}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Thêm ảnh
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {previewUrls.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">Chưa có ảnh nào được chọn</p>
                                    <p className="text-xs text-gray-400 mt-1">Ảnh đầu tiên sẽ là ảnh đại diện</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-3">
                                    {previewUrls.map((url, i) => (
                                        <div key={i} className="group relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 aspect-square">
                                            <img src={url} alt={`preview-${i}`} className="w-full h-full object-cover" />
                                            {i === 0 && (
                                                <div className="absolute top-0 left-0 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-br-lg">
                                                    Đại diện
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo sản phẩm
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

