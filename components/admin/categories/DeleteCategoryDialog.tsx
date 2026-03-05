'use client';

import React from 'react';
import type { Category } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DeleteCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category | null;
    childrenCount: number;
    onConfirm: () => void;
    isPending: boolean;
}

export function DeleteCategoryDialog({
    open,
    onOpenChange,
    category,
    childrenCount,
    onConfirm,
    isPending,
}: DeleteCategoryDialogProps) {
    if (!category) return null;

    const productCount = category._count?.products ?? 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Xóa danh mục</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc muốn xóa danh mục{' '}
                        <span className="font-semibold">&quot;{category.name}&quot;</span>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                    {childrenCount > 0 && (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                            <span className="text-lg leading-none">⚠️</span>
                            <span>
                                Danh mục này có <strong>{childrenCount}</strong> danh mục con.
                                Các danh mục con sẽ trở thành danh mục gốc.
                            </span>
                        </div>
                    )}
                    {productCount > 0 && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                            <span className="text-lg leading-none">⚠️</span>
                            <span>
                                Danh mục này có <strong>{productCount}</strong> sản phẩm liên quan.
                                Vui lòng chuyển sản phẩm sang danh mục khác trước.
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xóa danh mục
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
