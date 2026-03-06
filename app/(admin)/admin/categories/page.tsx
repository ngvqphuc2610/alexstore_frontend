'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { toast } from 'sonner';
import type { Category } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryStatsCards } from '@/components/admin/categories/CategoryStatsCards';
import { CategoryTreeTable } from '@/components/admin/categories/CategoryTreeTable';
import { CategoryFormDialog } from '@/components/admin/categories/CategoryFormDialog';
import { DeleteCategoryDialog } from '@/components/admin/categories/DeleteCategoryDialog';

const EMPTY_FORM = { name: '', parentId: 'none', allowedSellerTypes: [] as string[] };

export default function AdminCategoriesPage() {
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selected, setSelected] = useState<Category | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    // ─── Data ─────────────────────────────────────────────────────────────────
    const { data: categories = [], isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getAll,
    });

    const sorted = [...categories].sort((a, b) => a.id - b.id);
    const rootCount = sorted.filter(c => c.parentId === null).length;
    const childCount = sorted.filter(c => c.parentId !== null).length;
    const getChildrenCount = (id: number) => sorted.filter(c => c.parentId === id).length;

    // ─── Mutations ────────────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: categoriesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setCreateOpen(false);
            setFormData(EMPTY_FORM);
            toast.success('Đã tạo danh mục mới');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi tạo danh mục'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => categoriesService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setEditOpen(false);
            toast.success('Đã cập nhật danh mục');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật'),
    });

    const deleteMutation = useMutation({
        mutationFn: categoriesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setDeleteOpen(false);
            toast.success('Đã xóa danh mục');
        },
        onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa'),
    });

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleCreate = () => {
        if (!formData.name.trim()) { toast.error('Vui lòng nhập tên danh mục'); return; }
        createMutation.mutate({
            name: formData.name,
            parentId: formData.parentId === 'none' ? null : Number(formData.parentId),
            allowedSellerTypes: formData.allowedSellerTypes,
        });
    };

    const handleUpdate = () => {
        if (!selected || !formData.name.trim()) { toast.error('Vui lòng nhập tên danh mục'); return; }
        const parentId = formData.parentId === 'none' ? null : Number(formData.parentId);
        if (parentId === selected.id) { toast.error('Không thể chọn chính nó làm cha'); return; }
        updateMutation.mutate({
            id: selected.id,
            data: { name: formData.name, parentId, allowedSellerTypes: formData.allowedSellerTypes },
        });
    };

    const openEdit = (cat: Category) => {
        setSelected(cat);
        setFormData({
            name: cat.name,
            parentId: cat.parentId ? cat.parentId.toString() : 'none',
            allowedSellerTypes: cat.allowedSellerTypes?.map(t => t.sellerType) || [],
        });
        setEditOpen(true);
    };

    const openCreateChild = (parent: Category) => {
        setFormData({ name: '', parentId: parent.id.toString(), allowedSellerTypes: [] });
        setCreateOpen(true);
    };

    const openDelete = (cat: Category) => {
        setSelected(cat);
        setDeleteOpen(true);
    };

    // ─── Error ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex h-[400px] items-center justify-center text-red-500 flex-col gap-4">
                <p>Đã xảy ra lỗi khi tải danh mục.</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}>
                    Thử lại
                </Button>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý danh mục</h1>
                    <p className="text-muted-foreground mt-1">Tổ chức và phân loại sản phẩm theo cây danh mục</p>
                </div>
                <Button className="gap-2" onClick={() => { setFormData(EMPTY_FORM); setCreateOpen(true); }}>
                    <Plus className="h-4 w-4" />
                    Thêm danh mục
                </Button>
            </div>

            <CategoryStatsCards total={categories.length} rootCount={rootCount} childCount={childCount} />

            <CategoryTreeTable
                categories={categories}
                isLoading={isLoading}
                onEdit={openEdit}
                onDelete={openDelete}
                onCreateChild={openCreateChild}
            />

            {/* Create Dialog */}
            <CategoryFormDialog
                open={createOpen}
                onOpenChange={(open) => { setCreateOpen(open); if (!open) setFormData(EMPTY_FORM); }}
                mode="create"
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
                categories={categories}
            />

            {/* Edit Dialog */}
            <CategoryFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                mode="edit"
                formData={formData}
                onFormDataChange={setFormData}
                onSubmit={handleUpdate}
                isPending={updateMutation.isPending}
                categories={categories}
                editingCategory={selected}
            />

            {/* Delete Dialog */}
            <DeleteCategoryDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                category={selected}
                childrenCount={selected ? getChildrenCount(selected.id) : 0}
                onConfirm={() => selected && deleteMutation.mutate(selected.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
