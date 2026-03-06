'use client';

import React, { useState } from 'react';
import type { Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    FolderTree,
    MoreHorizontal,
    Edit,
    Trash2,
    FolderPlus,
    Loader2,
    ChevronDown,
    ChevronRight,
    Folder,
    FileText,
} from 'lucide-react';

interface CategoryTreeTableProps {
    categories: Category[];
    isLoading: boolean;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onCreateChild: (parentCategory: Category) => void;
}

export function CategoryTreeTable({
    categories,
    isLoading,
    onEdit,
    onDelete,
    onCreateChild,
}: CategoryTreeTableProps) {
    const sorted = [...categories].sort((a, b) => a.id - b.id);
    const roots = sorted.filter(c => c.parentId === null);
    const getChildren = (parentId: number) => sorted.filter(c => c.parentId === parentId);

    if (isLoading) {
        return (
            <Card className="border-0 shadow-md">
                <CardContent className="py-12">
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (categories.length === 0) {
        return (
            <Card className="border-0 shadow-md">
                <CardContent className="py-16">
                    <div className="text-center text-muted-foreground">
                        <FolderTree className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium">Chưa có danh mục nào</p>
                        <p className="text-sm mt-1">Hãy tạo danh mục đầu tiên để bắt đầu</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Cây danh mục
                </CardTitle>
                <CardDescription>Quản lý cấu trúc phân cấp cha/con của danh mục</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-0.5">
                    {roots.map((root) => (
                        <CategoryTreeNode
                            key={root.id}
                            category={root}
                            depth={0}
                            getChildren={getChildren}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onCreateChild={onCreateChild}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Tree Node ──────────────────────────────────────────────────────────────

interface CategoryTreeNodeProps {
    category: Category;
    depth: number;
    getChildren: (parentId: number) => Category[];
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onCreateChild: (parentCategory: Category) => void;
}

function CategoryTreeNode({
    category,
    depth,
    getChildren,
    onEdit,
    onDelete,
    onCreateChild,
}: CategoryTreeNodeProps) {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;
    const [expanded, setExpanded] = useState(true);
    const productCount = category._count?.products ?? 0;
    const allowedTypes = category.allowedSellerTypes ?? [];

    return (
        <div>
            {/* Node row */}
            <div
                className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60
                    ${depth === 0 ? 'bg-muted/30' : ''}`}
                style={{ paddingLeft: `${12 + depth * 24}px` }}
            >
                {/* Expand/collapse toggle */}
                <button
                    type="button"
                    onClick={() => hasChildren && setExpanded(!expanded)}
                    className={`h-5 w-5 flex items-center justify-center rounded transition-colors shrink-0
                        ${hasChildren ? 'hover:bg-muted-foreground/10 cursor-pointer text-muted-foreground' : 'text-transparent cursor-default'}`}
                >
                    {hasChildren ? (
                        expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
                    ) : (
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    )}
                </button>

                {/* Name & Toggle Area */}
                <div
                    className={`flex-1 flex items-center gap-2 cursor-pointer select-none`}
                    onClick={() => hasChildren && setExpanded(!expanded)}
                >
                    {/* Icon */}
                    {hasChildren || depth === 0 ? (
                        <Folder className={`h-4 w-4 shrink-0 ${depth === 0 ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                    ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    )}

                    <span className={`text-sm ${depth === 0 ? 'font-semibold' : 'font-medium'}`}>
                        {category.name}
                    </span>
                </div>

                {/* Badges: seller types */}
                <div className="hidden sm:flex items-center gap-1">
                    {allowedTypes.length > 0 ? (
                        allowedTypes.map(t => (
                            <Badge
                                key={t.sellerType}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 font-normal"
                            >
                                {t.sellerType}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-[10px] text-muted-foreground/50 italic">Admin only</span>
                    )}
                </div>

                {/* Product count */}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal tabular-nums">
                    {productCount} sp
                </Badge>

                {/* Children count */}
                {hasChildren && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal tabular-nums">
                        {children.length} con
                    </Badge>
                )}

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Edit className="mr-2 h-4 w-4" /> Sửa danh mục
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCreateChild(category)}>
                            <FolderPlus className="mr-2 h-4 w-4" /> Thêm danh mục con
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDelete(category)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Children */}
            {hasChildren && expanded && (
                <div className="relative">
                    {/* Vertical tree line */}
                    <div
                        className="absolute top-0 bottom-2 border-l-2 border-muted-foreground/10"
                        style={{ left: `${24 + depth * 24}px` }}
                    />
                    {children.map((child) => (
                        <CategoryTreeNode
                            key={child.id}
                            category={child}
                            depth={depth + 1}
                            getChildren={getChildren}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onCreateChild={onCreateChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
