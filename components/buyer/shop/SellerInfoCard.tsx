'use client';

import React from 'react';
import Link from 'next/link';
import { Store, BadgeCheck, MessageSquare, Package, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SellerInfoData {
    id: string;
    username: string;
    createdAt?: string;
    totalProducts?: number;
    sellerProfile?: {
        shopName: string;
        sellerType: string;
        verificationStatus: string;
        shopRating: number;
    };
}

interface SellerInfoCardProps {
    seller: SellerInfoData;
    sellerId: string;
}

function getTimeSinceJoined(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} ngày`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} tháng`;
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    if (remainingMonths === 0) return `${diffYears} năm`;
    return `${diffYears} năm ${remainingMonths} tháng`;
}

export default function SellerInfoCard({ seller, sellerId }: SellerInfoCardProps) {
    const profile = seller.sellerProfile;
    const shopName = profile?.shopName || seller.username;
    const rating = profile?.shopRating ?? 0;
    const isVerified = profile?.verificationStatus === 'APPROVED';
    const joinedTime = getTimeSinceJoined(seller.createdAt);

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Avatar + Info */}
                <div className="flex items-center gap-5">
                    <div className="size-20 md:size-24 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-600 flex items-center justify-center text-primary shadow-sm overflow-hidden">
                        <Store className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{shopName}</h4>
                            {isVerified && (
                                <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-500" />
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            {profile?.sellerType === 'MALL' ? 'Mall Chính hãng' : profile?.sellerType === 'PRO' ? 'Seller Pro' : 'Người bán trên AlexStore'}
                        </p>
                    </div>
                </div>

                {/* Middle: Stats */}
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-10">
                    <div className="text-center">
                        <p className="text-xl font-extrabold text-primary">{seller.totalProducts ?? 0}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sản phẩm</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <p className="text-xl font-extrabold text-primary">{rating.toFixed(1)}</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đánh giá</p>
                    </div>
                    {joinedTime && (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Clock className="h-4 w-4 text-primary" />
                                <p className="text-xl font-extrabold text-primary">{joinedTime}</p>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tham gia</p>
                        </div>
                    )}
                </div>

                {/* Right: Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button asChild className="shadow-lg shadow-primary/20">
                        <Link href={`/shop/${sellerId}`}>
                            <Store className="h-4 w-4 mr-2" />
                            Xem Shop
                        </Link>
                    </Button>
                    <Button variant="outline" className="border-primary/20">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Nhắn tin
                    </Button>
                </div>
            </div>
        </div>
    );
}
