'use client';

import React from 'react';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followsService } from '@/services/follows.service';
import { toast } from 'sonner';
import { Store, UserMinus, Star, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function FollowingPage() {
    const queryClient = useQueryClient();

    const { data: followingRaw, isLoading } = useQuery({
        queryKey: ['following'],
        queryFn: followsService.getFollowing,
    });
    const following = (followingRaw as any);

    const unfollowMutation = useMutation({
        mutationFn: (sellerId: string) => followsService.unfollow(sellerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['following'] });
            toast.success('Đã bỏ theo dõi cửa hàng');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Có lỗi xảy ra');
        }
    });

    return (
        <ProfileLayout>
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Đang theo dõi</CardTitle>
                            <CardDescription>
                                Danh sách các cửa hàng bạn đang theo dõi
                            </CardDescription>
                        </div>
                        {following && Array.isArray(following) && (
                            <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                                {following.length} Cửa hàng
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Đang tải danh sách...</p>
                        </div>
                    ) : (following && Array.isArray(following) && following.length === 0) || !following ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                <Store className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-slate-900">Chưa theo dõi cửa hàng nào</p>
                                <p className="text-slate-500">Hãy khám phá các cửa hàng yêu thích để theo dõi nhé!</p>
                            </div>
                            <Button asChild className="mt-4">
                                <Link href="/">Khám phá ngay</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {following && Array.isArray(following) && following.map((item: any) => (
                                <div 
                                    key={item.seller.id}
                                    className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50/50 transition-all gap-4"
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-16 w-16 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <Store className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link 
                                                href={`/shop/${item.seller.id}`}
                                                className="font-bold text-slate-900 hover:text-primary transition-colors block truncate"
                                            >
                                                {item.seller.shopName || item.seller.username}
                                            </Link>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                <span className="flex items-center text-yellow-500 font-medium">
                                                    <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                                                    {item.seller.shopRating.toFixed(1)}
                                                </span>
                                                <span>•</span>
                                                <span>{item.seller.sellerType}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="flex-1 sm:flex-none text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                                            onClick={() => unfollowMutation.mutate(item.seller.id)}
                                            disabled={unfollowMutation.isPending}
                                        >
                                            {unfollowMutation.isPending && unfollowMutation.variables === item.seller.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <UserMinus className="h-4 w-4 mr-2" />
                                                    Bỏ theo dõi
                                                </>
                                            )}
                                        </Button>
                                        <Button asChild size="sm" className="flex-1 sm:flex-none btn-primary shadow-sm hover:translate-x-1 transition-transform">
                                            <Link href={`/shop/${item.seller.id}`}>
                                                Đến Shop
                                                <ArrowRight className="h-4 w-4 ml-1.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </ProfileLayout>
    );
}
