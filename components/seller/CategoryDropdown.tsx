'use client';

import React, { useMemo } from 'react';
import type { Category } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, FolderTree } from 'lucide-react';

interface CategoryDropdownProps {
    categories: Category[];
    value?: number;
    onChange: (value: number) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function CategoryDropdown({
    categories,
    value,
    onChange,
    placeholder = "Chọn danh mục",
    disabled
}: CategoryDropdownProps) {
    // Build tree structure
    const tree = useMemo(() => {
        const sorted = [...categories].sort((a, b) => a.id - b.id);
        const roots = sorted.filter(c => c.parentId === null);
        const getChildren = (parentId: number) => sorted.filter(c => c.parentId === parentId);

        return { roots, getChildren };
    }, [categories]);

    // Recursive render function for menu items
    const renderNode = (category: Category) => {
        const children = tree.getChildren(category.id);

        if (children.length === 0) {
            return (
                <DropdownMenuItem
                    key={category.id}
                    onClick={() => onChange(category.id)}
                    className={value === category.id ? "bg-accent" : ""}
                >
                    {category.name}
                </DropdownMenuItem>
            );
        }

        return (
            <DropdownMenuSub key={category.id}>
                <DropdownMenuSubTrigger>
                    {category.name}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    {/* Allow selecting the parent itself as well */}
                    <DropdownMenuItem
                        onClick={() => onChange(category.id)}
                        className={`font-semibold text-indigo-600 ${value === category.id ? "bg-accent" : ""}`}
                    >
                        Chọn "{category.name}"
                    </DropdownMenuItem>
                    {children.map(child => renderNode(child))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        );
    };

    const selectedCategory = categories.find(c => c.id === value);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <Button
                    variant="outline"
                    className={`w-full justify-between font-normal ${!value ? "text-muted-foreground" : ""}`}
                >
                    <span className="flex items-center gap-2 truncate">
                        {value ? (
                            <>
                                <FolderTree className="h-4 w-4 text-indigo-500" />
                                {selectedCategory?.name || "Danh mục không tồn tại"}
                            </>
                        ) : (
                            placeholder
                        )}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto" align="start">
                {tree.roots.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                        Không có danh mục nào
                    </div>
                ) : (
                    tree.roots.map(root => renderNode(root))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
