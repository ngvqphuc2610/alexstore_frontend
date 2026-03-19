'use client';

import React from 'react';
import { Store, UserPlus, UserMinus, MessageSquare, BadgeCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SellerPublicProfile } from '@/types';
import { useQuery, useMutation } from '@tanstack/react-query';
import { followsService } from '@/services/follows.service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface ShopHeaderProps {
    profile: SellerPublicProfile;
}

export default function ShopHeader({ profile }: ShopHeaderProps) {
    const { isAuthenticated } = useAuthStore();
    const isVerified = profile.sellerType === 'MALL' || profile.sellerType === 'PRO';

    const { data: followStatus, isLoading: isStatusLoading, refetch: refetchStatus } = useQuery({
        queryKey: ['follow-status', profile.id],
        queryFn: () => followsService.getStatus(profile.id),
        enabled: !!profile.id && isAuthenticated,
    });

    const toggleFollowMutation = useMutation({
        mutationFn: () => followStatus?.isFollowing 
            ? followsService.unfollow(profile.id) 
            : followsService.follow(profile.id),
        onSuccess: () => {
            refetchStatus();
            toast.success(followStatus?.isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi cửa hàng');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    });

    const [isHovered, setIsHovered] = React.useState(false);

    const handleFollowClick = () => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để theo dõi cửa hàng');
            return;
        }
        toggleFollowMutation.mutate();
    };

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
                                    • {profile.stats.followerCount.toLocaleString()} người theo dõi
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 text-sm">
                                    • Tham gia {new Date(profile.stats.joinedAt).getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <Button 
                            variant={followStatus?.isFollowing ? (isHovered ? "destructive" : "secondary") : "default"} 
                            className={`gap-2 px-6 min-w-[150px] transition-all duration-200 ${
                                !followStatus?.isFollowing && !toggleFollowMutation.isPending 
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent" 
                                : ""
                            }`}
                            onClick={handleFollowClick}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            disabled={toggleFollowMutation.isPending || (isAuthenticated && isStatusLoading)}
                        >
                            {toggleFollowMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : followStatus?.isFollowing ? (
                                isHovered ? (
                                    <>
                                        <UserMinus className="h-4 w-4" />
                                        Bỏ theo dõi
                                    </>
                                ) : (
                                    <>
                                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                                        Đang theo dõi
                                    </>
                                )
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    Theo dõi
                                </>
                            )}
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
