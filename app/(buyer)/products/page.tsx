'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, ChevronDown, Check, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { categoriesService } from '@/services/categories.service';

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `/api/proxy${url}`;
};

export default function ProductsPage() {
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getAll,
    });

    const { data: paginatedProducts, isLoading } = useQuery({
        queryKey: ['products', activeCategory],
        queryFn: () => productsService.getAll(activeCategory !== 'all' ? { categoryId: activeCategory } : undefined),
    });

    const products = paginatedProducts?.data || [];

    const fallbackCategories = [
        { id: 1, name: 'Điện thoại thông minh' },
        { id: 2, name: 'Laptop' },
        { id: 3, name: 'Tai nghe' }
    ];

    const displayCategories = (categories && categories.length > 0) ? categories : fallbackCategories;

    return (
        <>
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Sản phẩm</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 shrink-0 space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 font-bold text-gray-900 mb-4 pb-4 border-b">
                            <Filter className="h-5 w-5" /> Bộ Lọc Căn Bản
                        </div>

                        <div className="space-y-4">
                            {/* Category Filter */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Danh mục</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveCategory('all')}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === 'all' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        Tất cả
                                        {activeCategory === 'all' && <Check className="h-4 w-4" />}
                                    </button>

                                    {displayCategories.map((cat: any) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat.name}
                                            {activeCategory === cat.id && <Check className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Khoảng Giá</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Từ" className="w-full border rounded-md px-3 py-1.5 text-sm" />
                                    <input type="text" placeholder="Đến" className="w-full border rounded-md px-3 py-1.5 text-sm" />
                                </div>
                                <Button className="w-full mt-3 h-8 text-xs">Áp dụng</Button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Top Bar Area */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Tất cả sản phẩm <span className="text-base font-normal text-gray-500">({products.length} kết quả)</span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">Sắp xếp theo:</span>
                            <button className="flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100">
                                Mới nhất <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {isLoading ? (
                        <div className="w-full flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                            {products.map((p: any) => (
                                <Link href={`/products/${p.id}`} className="block">
                                    <Card className="group overflow-hidden border border-gray-100 bg-white hover:shadow-lg hover:border-primary/20 transition-all duration-300">

                                        <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                            {p.images && p.images.length > 0 ? (
                                                <img
                                                    src={getImageUrl(
                                                        p.images.find((img: any) => img.isPrimary)?.imageUrl ||
                                                        p.images[0].imageUrl
                                                    )}
                                                    alt={p.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <ShoppingBag className="h-16 w-16 opacity-20" />
                                            )}
                                        </div>

                                        <CardContent className="p-4">
                                            ...
                                            <p className="font-medium text-gray-900 line-clamp-2 text-sm">
                                                {p.name}
                                            </p>
                                        </CardContent>

                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500">
                            Không tìm thấy sản phẩm nào trong danh mục này.
                        </div>
                    )}

                    {/* Pagination Mock */}
                    {!isLoading && products.length > 0 && (
                        <div className="mt-10 flex justify-center">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="w-8 h-8 p-0" disabled>1</Button>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-500 hover:bg-gray-100">2</Button>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-500 hover:bg-gray-100">3</Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

        </>
    );
}
