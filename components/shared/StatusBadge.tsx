'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    configMap: Record<string, { label: string; color: string }>;
    className?: string;
}

export function StatusBadge({ status, configMap, className }: StatusBadgeProps) {
    const config = configMap[status];

    if (!config) {
        return (
            <Badge variant="outline" className={className}>
                {status}
            </Badge>
        );
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                config.color,
                className
            )}
        >
            {config.label}
        </span>
    );
}
