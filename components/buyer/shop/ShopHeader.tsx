'use client';

import React from 'react';
import { Store, UserPlus, MessageSquare, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SellerPublicProfile } from '@/types';

interface ShopHeaderProps {
    profile: SellerPublicProfile;
}

export default function ShopHeader({ profile }: ShopHeaderProps) {
    const isVerified = profile.sellerType === 'MALL' || profile.sellerType === 'PRO';

    return (
        <section className="mb-8 overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
            {/* Banner Background */}
            <div className="relative h-48 sm:h-64 w-full bg-slate-200 dark:bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-indigo-600/40" />
                {/* Fallback pattern if no shop banner */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative px-6 pb-6 pt-16 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 -mt-20 sm:-mt-12">
                    
                    {/* Logo & Info */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-lg border border-slate-100 dark:border-slate-700 flex-shrink-0 flex items-center justify-center">
                            <Store className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                                    {profile.shopName}
                                </h1>
                                {isVerified && <BadgeCheck className="h-6 w-6 text-blue-500" />}
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-1">
                                <span className="flex items-center text-primary font-semibold">
                                    <StarIcon className="h-4 w-4 mr-1 fill-current" />
                                    <span>{profile.stats.rating.toFixed(1)}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">
                                        ({profile.stats.totalReviews.toLocaleString()} đánh giá)
                                    </span>
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 text-sm">
                                    {profile.stats.totalProducts.toLocaleString()} sản phẩm
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 text-sm">
                                    • Tham gia {new Date(profile.stats.joinedAt).getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" className="gap-2 px-6 border-slate-200 dark:border-slate-700">
                            <UserPlus className="h-4 w-4" />
                            Theo dõi
                        </Button>
                        <Button className="gap-2 px-6 shadow-md shadow-primary/20">
                            <MessageSquare className="h-4 w-4" />
                            Nhắn tin
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Minimal Star icon to avoid missing import
function StarIcon(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    )
}
