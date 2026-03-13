'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Star, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { getImageUrl } from '@/lib/utils';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

function getProductImage(product: Product): string {
    const primary = product.images?.find((img) => img.isPrimary);
    const raw = primary?.imageUrl || product.images?.[0]?.imageUrl || '';
    return getImageUrl(raw);
}

function ProductCard({ product, index }: { product: Product; index: number }) {
    const imageSrc = getProductImage(product);

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className="group min-w-[200px] bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
        >
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {imageSrc && imageSrc !== '/placeholder-product.png' ? (
                    <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="bg-white text-gray-900 hover:bg-white shadow text-[10px] h-8 px-3">
                            Quick View
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="p-3">
                <Link
                    href={`/products/${product.id}`}
                    className="text-xs font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors leading-snug"
                >
                    {product.name}
                </Link>
                <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] text-gray-500">{Number(product.avgRating).toFixed(1)}</span>
                </div>
                <p className="mt-1.5 font-bold text-primary text-sm">
                    {Number(product.price).toLocaleString('vi-VN')}đ
                </p>
            </div>
        </motion.article>
    );
}

export default function RecommendedForYou() {
    const getTopCategories = useRecentlyViewedStore((state) => state.getTopCategories);
    const topCategoryIds = getTopCategories(3); // Get top 3 categories

    const { data, isLoading } = useQuery({
        queryKey: ['products', 'recommendations', topCategoryIds],
        queryFn: () => productsService.getRecommendations(topCategoryIds),
        staleTime: 5 * 60 * 1000,
    });

    const products = data?.data || [];

    if (!isLoading && products.length === 0) return null;

    return (
        <section className="py-10 bg-white border-b">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-5 w-5 text-primary fill-primary/20" />
                    <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="min-w-[200px] aspect-[4/5] rounded-xl bg-gray-100 animate-pulse" />
                        ))
                        : products.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))}
                </div>
            </div>
        </section>
    );
}
