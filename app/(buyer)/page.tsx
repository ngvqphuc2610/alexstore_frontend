'use client';

import React from 'react';
import { ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import HeroCarousel from '@/components/buyer/home/HeroCarousel';
import CategoryGrid from '@/components/buyer/home/CategoryGrid';
import FlashDeals from '@/components/buyer/home/FlashDeals';
import FeaturedShops from '@/components/buyer/home/FeaturedShops';
import MarketplaceFeed from '@/components/buyer/home/MarketplaceFeed';
import RecommendedForYou from '@/components/buyer/home/RecommendedForYou';
import RecentlyViewed from '@/components/buyer/home/RecentlyViewed';

const GUARANTEES = [
    {
        icon: Truck,
        color: 'blue',
        title: 'Free Shipping',
        desc: 'On all orders over 500k',
    },
    {
        icon: RefreshCw,
        color: 'green',
        title: '30-Day Returns',
        desc: 'Easy and hassle-free returns',
    },
    {
        icon: ShieldCheck,
        color: 'orange',
        title: 'Secure Payment',
        desc: '100% secure transactions',
    },
] as const;

const COLOR_MAP: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
};

export default function Home() {
    return (
        <main className="flex-1 flex flex-col">
            {/* Hero Carousel */}
            <HeroCarousel />

            {/* Trust guarantees strip */}
            <section className="py-5 bg-white border-b">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {GUARANTEES.map(({ icon: Icon, color, title, desc }) => (
                            <div key={title} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-50">
                                <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${COLOR_MAP[color]}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{title}</p>
                                    <p className="text-xs text-gray-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop by Category */}
            <CategoryGrid />

            {/* Flash Deals */}
            <FlashDeals />

            {/* Featured Shops */}
            <FeaturedShops />

            {/* Marketplace Feed */}
            <MarketplaceFeed />

            {/* Recommended For You */}
            <RecommendedForYou />

            {/* Recently Viewed */}
            <RecentlyViewed />
        </main>
    );
}
