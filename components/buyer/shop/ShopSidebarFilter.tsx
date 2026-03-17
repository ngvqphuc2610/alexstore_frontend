'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface ShopSidebarFilterProps {
    onFilterChange: (filters: any) => void;
}

export default function ShopSidebarFilter({ onFilterChange }: ShopSidebarFilterProps) {
    return (
        <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
                {/* Categories */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Danh mục</h4>
                    <div className="flex flex-col gap-2">
                        {/* Placeholder Categories - Tránh call API thừa, sẽ implement link category logic sau */}
                        <button className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 text-primary font-medium text-sm transition-colors w-full text-left">
                            Tất cả sản phẩm
                        </button>
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Khoảng giá</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">đ</span>
                                <input 
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-7 pr-3 text-sm focus:ring-2 focus:ring-primary dark:text-white outline-none" 
                                    placeholder="Tối thiểu" 
                                    type="number"
                                />
                            </div>
                            <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">đ</span>
                                <input 
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-7 pr-3 text-sm focus:ring-2 focus:ring-primary dark:text-white outline-none" 
                                    placeholder="Tối đa" 
                                    type="number"
                                />
                            </div>
                        </div>
                        <Button className="w-full">Áp dụng</Button>
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Đánh giá</h4>
                    <div className="space-y-3">
                        {[4, 3, 2].map(rating => (
                            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary" />
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                            key={star} 
                                            className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">& trở lên</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
