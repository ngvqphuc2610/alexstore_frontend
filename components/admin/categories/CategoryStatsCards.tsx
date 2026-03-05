'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FolderTree, Layers, GitBranch } from 'lucide-react';

interface CategoryStatsCardsProps {
    total: number;
    rootCount: number;
    childCount: number;
}

export function CategoryStatsCards({ total, rootCount, childCount }: CategoryStatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">Tổng danh mục</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-indigo-600">{rootCount}</div>
                        <p className="text-xs text-muted-foreground">Danh mục gốc</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-600">{childCount}</div>
                        <p className="text-xs text-muted-foreground">Danh mục con</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
