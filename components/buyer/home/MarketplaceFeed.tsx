'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Product, ProductFilters } from '@/types';

type FeedFilter = 'new' | 'bestseller';

const FILTERS: { label: string; value: FeedFilter }[] = [
    { label: 'New Arrivals', value: 'new' },
    { label: 'Best Sellers', value: 'bestseller' },
];

const FILTER_PARAMS: Record<FeedFilter, Partial<ProductFilters>> = {
    new: { sortBy: 'createdAt', sortOrder: 'desc' },
    bestseller: { sortBy: 'avgRating', sortOrder: 'desc' },
};

function getProductImage(product: Product): string {
    const primary = product.images?.find((img) => img.isPrimary);
    const raw = primary?.imageUrl || product.images?.[0]?.imageUrl || '';
    return getImageUrl(raw);
}

function ProductCard({ product, index }: { product: Product; index: number }) {
    const imageSrc = getProductImage(product);
    const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
    const currentPrice = Number(product.price);
    const discount = originalPrice && originalPrice > currentPrice 
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
        : 0;

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
            {/* Image */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {imageSrc && imageSrc !== '/placeholder-product.png' ? (
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {discount > 0 && (
                    <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        -{discount}%
                    </span>
                )}

                {/* Quick overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="bg-white text-gray-900 hover:bg-white shadow gap-1.5">
                            <ShoppingCart className="h-3.5 w-3.5" /> Quick View
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Body */}
            <div className="p-3">
                {/* Verified seller badge */}
                {product.seller && (
                    <div className="flex items-center gap-1 mb-1.5">
                        <ShieldCheck className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] text-blue-500 font-medium">Verified Seller</span>
                    </div>
                )}

                <Link
                    href={`/products/${product.id}`}
                    className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors leading-snug"
                >
                    {product.name}
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-1.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">
                        {Number(product.avgRating).toFixed(1)}
                    </span>
                </div>

                {/* Price & seller name */}
                <div className="mt-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="font-bold text-primary text-sm leading-none">
                            {currentPrice.toLocaleString('vi-VN')}đ
                        </span>
                        {originalPrice && originalPrice > currentPrice && (
                            <span className="text-[10px] text-gray-400 line-through leading-none">
                                {originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                        )}
                    </div>
                    {product.seller && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {product.seller.username}
                        </p>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export default function MarketplaceFeed() {
    const [filter, setFilter] = useState<FeedFilter>('new');
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['products', 'marketplace-feed', filter, page],
        queryFn: () => productsService.getAll({
            ...FILTER_PARAMS[filter],
            status: 'APPROVED',
            limit: 10,
            page,
        }),
        staleTime: 2 * 60 * 1000,
    });

    const products = (data as { data?: Product[]; items?: Product[] } | undefined)?.data
        || (data as { data?: Product[]; items?: Product[] } | undefined)?.items
        || [];

    const handleFilterChange = (value: FeedFilter) => {
        setFilter(value);
        setPage(1);
    };

    return (
        <section className="py-10 bg-white border-b">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Marketplace Feed</h2>
                    <div className="flex gap-2">
                        {FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => handleFilterChange(f.value)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    filter === f.value
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {(isLoading || isFetching)
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                        ))
                        : products.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))}
                </div>

                {/* Load more */}
                {products.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={isFetching}
                            className="min-w-40"
                        >
                            {isFetching ? 'Loading...' : 'Load More Products'}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
