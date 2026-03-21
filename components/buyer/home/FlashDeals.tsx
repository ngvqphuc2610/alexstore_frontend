'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, Heart, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { getImageUrl } from '@/lib/utils';
import type { Product } from '@/types';

// Countdown timer hook — target is next midnight (end of day flash deals)
function useCountdown() {
    const getTimeLeft = () => {
        const now = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const diff = end.getTime() - now.getTime();
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    };

    // Start with null to avoid hydration mismatch (server time ≠ client time)
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        // Set initial value on client only
        setTimeLeft(getTimeLeft());
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    return timeLeft;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="h-10 w-12 bg-gray-900 text-white rounded font-mono font-bold text-xl flex items-center justify-center tabular-nums">
                {String(value).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 uppercase">{label}</span>
        </div>
    );
}

function getProductImage(product: Product): string {
    const primary = product.images?.find((img) => img.isPrimary);
    const raw = primary?.imageUrl || product.images?.[0]?.imageUrl || '';
    return getImageUrl(raw);
}

function FlashProductCard({ product }: { product: Product }) {
    const [wishlisted, setWishlisted] = useState(false);
    const imageSrc = getProductImage(product);

    const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
    const currentPrice = Number(product.price);
    const discount = originalPrice && originalPrice > currentPrice 
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
        : 0;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative group flex-shrink-0 w-48 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Discount badge */}
            {discount > 0 && (
                <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    -{discount}%
                </span>
            )}

            {/* Wishlist button */}
            <button
                onClick={() => setWishlisted((v) => !v)}
                aria-label="Add to wishlist"
                className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
            >
                <Heart
                    className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                />
            </button>

            {/* Image */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {imageSrc && imageSrc !== '/placeholder-product.png' ? (
                    <img src={imageSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-center gap-1 mb-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">{Number(product.avgRating).toFixed(1)} ({product.reviewCount})</span>
                </div>
                <Link href={`/products/${product.id}`} className="text-xs font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors leading-snug">
                    {product.name}
                </Link>
                <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-bold text-primary text-sm leading-none">
                        {currentPrice.toLocaleString('vi-VN')}đ
                    </span>
                    {originalPrice && originalPrice > currentPrice && (
                        <span className="text-[10px] text-gray-400 line-through leading-none">
                            {originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function FlashDeals() {
    const timeLeft = useCountdown();

    const { data, isLoading } = useQuery({
        queryKey: ['products', 'flash-deals'],
        queryFn: () => productsService.getAll({ limit: 8, sortBy: 'avgRating', sortOrder: 'desc', status: 'APPROVED' }),
        staleTime: 2 * 60 * 1000,
    });

    const products = (data as { data?: Product[]; items?: Product[] } | undefined)?.data
        || (data as { data?: Product[]; items?: Product[] } | undefined)?.items
        || [];

    if (!isLoading && products.length === 0) return null;

    return (
        <section className="py-10 bg-white border-b">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-red-500">
                            <Zap className="h-5 w-5 fill-red-500" />
                            <h2 className="text-xl font-bold text-gray-900">Flash Deals</h2>
                        </div>
                        <span className="text-xs text-gray-400">Hurry, limited stock available!</span>
                    </div>
                    {timeLeft && (
                        <div className="flex items-center gap-2">
                            <TimeUnit value={timeLeft.hours} label="Hours" />
                            <span className="text-gray-400 font-bold mb-4">:</span>
                            <TimeUnit value={timeLeft.minutes} label="Mins" />
                            <span className="text-gray-400 font-bold mb-4">:</span>
                            <TimeUnit value={timeLeft.seconds} label="Secs" />
                        </div>
                    )}
                </div>

                {/* Horizontal scroll product list */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-48 h-60 bg-gray-100 rounded-xl animate-pulse" />
                        ))
                        : products.map((product) => (
                            <FlashProductCard key={product.id} product={product} />
                        ))}
                </div>
            </div>
        </section>
    );
}
