'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useRecentlyViewedStore, type RecentlyViewedItem } from '@/stores/recentlyViewedStore';
import { getImageUrl } from '@/lib/utils';

export default function RecentlyViewed() {
    const { items } = useRecentlyViewedStore();

    // Hydrate state from localStorage (Zustand persist does this automatically)
    useEffect(() => {}, []);

    if (items.length === 0) return null;

    return (
        <section className="py-10 bg-gray-50">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
                </div>

                {/* Cards */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex-shrink-0 w-32 group"
                        >
                            <Link href={`/products/${item.id}`} className="block">
                                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2 group-hover:shadow-md transition-shadow">
                                {item.imageUrl ? (
                                    <img
                                        src={getImageUrl(item.imageUrl)}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-gray-700 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                                    {item.name}
                                </p>
                                <p className="text-xs font-bold text-primary mt-0.5">
                                    {Number(item.price).toLocaleString('vi-VN')}đ
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
