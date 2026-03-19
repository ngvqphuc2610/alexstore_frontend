'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { sellerProfileService } from '@/services/seller-profile.service';

import ShopHeader from '@/components/buyer/shop/ShopHeader';
import ShopStats from '@/components/buyer/shop/ShopStats';
import ShopSidebarFilter from '@/components/buyer/shop/ShopSidebarFilter';

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `/api/proxy${url}`;
};

export default function ShopProfilePage({ params }: { params: Promise<{ shopId: string }> }) {
    const resolvedParams = use(params);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});

    // Fetch Seller Profile
    const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
        queryKey: ['seller-profile', resolvedParams.shopId],
        queryFn: () => sellerProfileService.getPublicProfile(resolvedParams.shopId),
    });

    // Fetch Shop Products
    const { data: paginatedProducts, isLoading: isProductsLoading } = useQuery({
        queryKey: ['products', resolvedParams.shopId, page, filters],
        queryFn: () => productsService.getAll({ sellerId: resolvedParams.shopId, page, limit: 12, ...filters }),
    });

    const products = paginatedProducts?.data || [];
    const meta = paginatedProducts?.meta;

    if (isProfileLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    if (isProfileError || !profile) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Store className="h-16 w-16 text-gray-300 mb-4 mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Cửa hàng không tồn tại</h2>
                    <p className="text-gray-500 mb-6">Cửa hàng này có thể đã bị xóa hoặc tạm khóa.</p>
                    <Button asChild>
                        <Link href="/">Quay về trang chủ</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <ShopHeader profile={profile} />
            <ShopStats profile={profile} />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white w-full sm:w-auto">
                    Sản phẩm ({meta?.total || 0})
                </h3>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 pb-12">
                <ShopSidebarFilter 
                    categories={profile.shopCategories || []} 
                    onFilterChange={(newFilters) => {
                        setFilters(newFilters);
                        setPage(1);
                    }} 
                />

                {/* Product Grid */}
                <div className="flex-1">
                    {isProductsLoading ? (
                        <div className="w-full flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-6">
                            {products.map((p: any) => (
                                <Link key={p.id} href={`/products/${p.id}`} className="block">
                                    <Card className="group overflow-hidden border border-gray-100 bg-white hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                                        <div className="relative aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
                                            {p.images && p.images.length > 0 ? (
                                                <img
                                                    src={getImageUrl(
                                                        p.images.find((img: any) => img.isPrimary)?.imageUrl ||
                                                        p.images[0].imageUrl
                                                    )}
                                                    alt={p.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="h-12 w-12 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4 flex flex-col flex-grow">
                                            <p className="text-xs font-medium text-primary mb-1 line-clamp-1">{p.category?.name}</p>
                                            <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">{p.name}</h4>
                                            <div className="mt-auto pt-2">
                                                <div className="flex items-center gap-1 mb-2">
                                                    <span className="text-xs font-bold text-slate-900">{Number(p.avgRating).toFixed(1)}</span>
                                                    <StarIcon className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                    <span className="text-xs text-slate-500">({p.reviewCount})</span>
                                                </div>
                                                <p className="text-lg font-bold text-primary">{Number(p.price).toLocaleString('vi-VN')}đ</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                            Không tìm thấy sản phẩm nào.
                        </div>
                    )}

                    {/* Pagination */}
                    {!isProductsLoading && meta && meta.totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                className="p-2 w-10 h-10 border-slate-200"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            {[...Array(meta.totalPages)].map((_, i) => (
                                <Button
                                    key={i}
                                    variant={page === i + 1 ? 'default' : 'outline'}
                                    className={`w-10 h-10 font-bold ${page !== i + 1 ? 'border-slate-200 text-slate-600' : ''}`}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                className="p-2 w-10 h-10 border-slate-200"
                                disabled={page >= meta.totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

function StarIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
