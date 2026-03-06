'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '@/services/admin-analytics.service';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Store, Loader2 } from 'lucide-react';

import { SellerListItem } from '@/types/analytics.types';

interface SellerSelectorProps {
    value: string;
    onValueChange: (value: string) => void;
}

export function SellerSelector({ value, onValueChange }: SellerSelectorProps) {
    const { data: sellers, isLoading } = useQuery({
        queryKey: ['admin-sellers-list'],
        queryFn: () => adminAnalyticsService.getSellersList(),
    });

    return (
        <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
                <SelectTrigger className="w-[200px]">
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Đang tải shop...</span>
                        </div>
                    ) : (
                        <SelectValue placeholder="Tất cả cửa hàng" />
                    )}
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                    {sellers?.map((seller: SellerListItem) => (
                        <SelectItem key={seller.id} value={seller.id}>
                            {seller.username}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

