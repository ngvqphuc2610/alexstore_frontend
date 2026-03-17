'use client';

import React from 'react';
import { MapPin, Zap, Clock } from 'lucide-react';
import type { SellerPublicProfile } from '@/types';

interface ShopStatsProps {
    profile: SellerPublicProfile;
}

export default function ShopStats({ profile }: ShopStatsProps) {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <MapPin className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Địa điểm</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[150px] lg:max-w-[200px]" title={profile.pickupAddress || 'Đang cập nhật'}>
                        {profile.pickupAddress ? profile.pickupAddress.split(',').pop()?.trim() : 'Đang cập nhật'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Zap className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tỉ lệ phản hồi</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">99%</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời gian phản hồi</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Vài giờ</p>
                </div>
            </div>
        </section>
    );
}
