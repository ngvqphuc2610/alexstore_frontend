'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/types';

// Dummy Categories to fallback if server empty
const fallbackCategoryList = [
    { id: 1, name: 'Điện thoại thông minh', icon: null },
    { id: 2, name: 'Laptop & Mac', icon: null },
];

export default function CategoriesPage() {
    const { data: categories, isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: categoriesService.getAll,
    });

    const displayCategories = (categories && categories.length > 0) ? categories : fallbackCategoryList;

    return (
        <>
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 text-sm text-gray-500 items-center">
                        <Link href="/" className="hover:text-primary">Trang chủ</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">Danh mục sản phẩm</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Danh Mục Sản Phẩm</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">Khám phá hàng ngàn sản phẩm từ các thương hiệu hàng đầu thế giới với mức giá tốt nhất.</p>
                </div>

                {isLoading ? (
                    <div className="w-full flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayCategories.map((cat: any) => (
                            <Card key={cat.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full">
                                <Link href={`/products?categoryId=${cat.id}`}>
                                    <CardContent className="p-0">
                                        <div className="p-8 flex items-start justify-between">
                                            <div className="p-4 rounded-2xl bg-gray-50 text-gray-600 group-hover:scale-110 transition-transform duration-300">
                                                <ShoppingBag className="h-8 w-8" />
                                            </div>
                                            <div className="h-8 w-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors text-gray-400">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <div className="px-8 pb-8">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-2">{cat.name}</h3>
                                            <p className="text-gray-500 text-sm">Xem sản phẩm</p>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

        </>
    );
}
