'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, Star, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import type { Product } from '@/types';

interface DerivedShop {
    id: string;
    name: string;
    productCount: number;
    avgRating: number;
}

function deriveShopsFromProducts(products: Product[]): DerivedShop[] {
    const shopMap = new Map<string, { name: string; ratings: number[]; count: number }>();

    for (const p of products) {
        if (!p.seller) continue;
        const sellerId = (p as any).sellerId || p.seller.id;
        if (!sellerId) continue;

        const existing = shopMap.get(sellerId);
        if (existing) {
            existing.ratings.push(Number(p.avgRating));
            existing.count += 1;
        } else {
            shopMap.set(sellerId, {
                name: p.seller.username || 'Shop',
                ratings: [Number(p.avgRating)],
                count: 1,
            });
        }
    }

    return Array.from(shopMap.entries())
        .map(([id, info]) => ({
            id,
            name: info.name,
            productCount: info.count,
            avgRating: info.ratings.reduce((a, b) => a + b, 0) / info.ratings.length,
        }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 6);
}

interface ShopCardProps {
    shop: DerivedShop;
    index: number;
}

function ShopCard({ shop, index }: ShopCardProps) {
    const initials = shop.name.slice(0, 2).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' as const }}
        >
            <Link
                href={`/products?sellerId=${shop.id}`}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
            >
                {/* Avatar */}
                <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-primary transition-colors">
                        {shop.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-500">{shop.avgRating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400 ml-1">• {shop.productCount}+ Products</span>
                    </div>
                    <span className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Verified Shop
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}

export default function FeaturedShops() {
    // Use the existing products endpoint to derive seller data
    const { data, isLoading } = useQuery({
        queryKey: ['products', 'for-featured-shops'],
        queryFn: () => productsService.getAll({ limit: 50, sortBy: 'avgRating', sortOrder: 'desc', status: 'APPROVED' }),
        staleTime: 5 * 60 * 1000,
    });

    const products = (data as { data?: Product[]; items?: Product[] } | undefined)?.data
        || (data as { data?: Product[]; items?: Product[] } | undefined)?.items
        || [];

    const shops = deriveShopsFromProducts(products);

    if (!isLoading && shops.length === 0) return null;

    return (
        <section className="py-10 bg-gray-50 border-b">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold text-gray-900">Featured Shops</h2>
                    </div>
                    <Link
                        href="/products"
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                        Explore all shops <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* Shop grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                        ))
                        : shops.map((shop, i) => (
                            <ShopCard key={shop.id} shop={shop} index={i} />
                        ))}
                </div>
            </div>
        </section>
    );
}
