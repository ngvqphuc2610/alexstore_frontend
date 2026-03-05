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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, FolderTree, CornerDownRight } from 'lucide-react';
import { SellerTypeCheckboxes } from './SellerTypeCheckboxes';

interface CategoryFormData {
    name: string;
    parentId: string;
    allowedSellerTypes: string[];
}

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    formData: CategoryFormData;
    onFormDataChange: (data: CategoryFormData) => void;
    onSubmit: () => void;
    isPending: boolean;
    categories: Category[];
    /** Category being edited — used to exclude self from parent list */
    editingCategory?: Category | null;
}

/**
 * Build a flat list of items with depth info for tree-style rendering in <Select>.
 * Supports multi-level nesting.
 */
function buildTreeOptions(categories: Category[], excludeId?: number) {
    const sorted = [...categories].sort((a, b) => a.id - b.id);
    const roots = sorted.filter(c => c.parentId === null);
    const getChildren = (parentId: number) => sorted.filter(c => c.parentId === parentId);

    const items: { id: number; name: string; depth: number }[] = [];

    function walk(cats: Category[], depth: number) {
        for (const cat of cats) {
            if (cat.id === excludeId) continue;
            items.push({ id: cat.id, name: cat.name, depth });
            walk(getChildren(cat.id), depth + 1);
        }
    }

    walk(roots, 0);
    return items;
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    mode,
    formData,
    onFormDataChange,
    onSubmit,
    isPending,
    categories,
    editingCategory,
}: CategoryFormDialogProps) {
    const isEdit = mode === 'edit';
    const treeOptions = buildTreeOptions(categories, editingCategory?.id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? 'Cập nhật thông tin và quyền truy cập của danh mục'
                            : 'Tạo danh mục mới để phân loại sản phẩm'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label>Tên danh mục</Label>
                        <Input
                            placeholder="Nhập tên danh mục..."
                            value={formData.name}
                            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                            autoFocus
                        />
                    </div>

                    {/* Parent selector — tree style */}
                    <div className="space-y-2">
                        <Label>Danh mục cha</Label>
                        <Select
                            value={formData.parentId}
                            onValueChange={(val) => onFormDataChange({ ...formData, parentId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục cha" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    <span className="flex items-center gap-2 text-muted-foreground">
                                        — Không có (danh mục gốc) —
                                    </span>
                                </SelectItem>
                                {treeOptions.map((item) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        <span
                                            className="flex items-center gap-1.5"
                                            style={{ paddingLeft: `${item.depth * 20}px` }}
                                        >
                                            {item.depth === 0 ? (
                                                <FolderTree className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                            ) : (
                                                <CornerDownRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                            )}
                                            <span className={item.depth === 0 ? 'font-medium' : ''}>
                                                {item.name}
                                            </span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Seller Types */}
                    <SellerTypeCheckboxes
                        value={formData.allowedSellerTypes}
                        onChange={(types) => onFormDataChange({ ...formData, allowedSellerTypes: types })}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Lưu thay đổi' : 'Tạo danh mục'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
