'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

interface CategorySelectorProps {
    value: string;
    onValueChange: (value: string) => void;
}

export function CategorySelector({ value, onValueChange }: CategorySelectorProps) {
    const { data: categories, isLoading } = useQuery({
        queryKey: ['admin-categories-list'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return (res as unknown as Category[]) || [];
        }
    });

    return (
        <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
