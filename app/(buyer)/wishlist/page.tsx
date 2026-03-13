'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/services/favorites.service';
import { cartService } from '@/services/cart.service';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';
import { Heart, ShoppingBag, Trash2, HeartCrack, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function WishlistPage() {
    const queryClient = useQueryClient();

    const { data: favorites = [], isLoading } = useQuery({
        queryKey: ['favorites'],
        queryFn: favoritesService.getFavorites,
    });

    const removeMutation = useMutation({
        mutationFn: favoritesService.removeFavorite,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            toast.success('Đã xóa khỏi danh sách yêu thích');
        }
    });

    const addToCartMutation = useMutation({
        mutationFn: cartService.addItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Đã thêm vào giỏ hàng');
        }
    });

    const handleRemove = (productId: string) => {
        removeMutation.mutate(productId);
    };

    const handleAddToCart = (productId: string) => {
        addToCartMutation.mutate({ productId, quantity: 1 });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 px-4 flex justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary transition-colors">Trang Chủ</Link>
                    <ChevronRight className="h-4 w-4 mx-2" />
                    <span className="text-gray-900 font-medium">Danh Sách Yêu Thích</span>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                        <Heart className="h-5 w-5 fill-current" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh Sách Yêu Thích Của Tôi</h1>
                    <span className="text-gray-500 font-medium">
                        ({favorites.length} sản phẩm)
                    </span>
                </div>

                {favorites.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border p-12 text-center max-w-2xl mx-auto flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <HeartCrack className="h-10 w-10 text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Danh sách yêu thích trống</h2>
                        <p className="text-gray-500 mb-8 max-w-md">
                            Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá và lưu lại những sản phẩm bạn quan tâm để mua sau nhé.
                        </p>
                        <Button asChild size="lg" className="rounded-full px-8">
                            <Link href="/">Tiếp tục mua sắm</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                <Link href={`/products/${item.product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                                    <img 
                                        src={item.product.images?.[0]?.imageUrl ? getImageUrl(item.product.images[0].imageUrl) : '/placeholder-product.svg'}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-product.svg';
                                        }}
                                    />
                                    {/* Delete Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemove(item.productId);
                                        }}
                                        className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-all focus:outline-none"
                                        title="Xóa khỏi yêu thích"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </Link>

                                <div className="p-4 flex-1 flex flex-col">
                                    <Link href={`/products/${item.product.id}`} className="block flex-1">
                                        <h3 className="font-medium tracking-tight text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                            {item.product.name}
                                        </h3>
                                        <div className="mt-2 text-sm text-gray-500">
                                            {item.product.seller?.username || 'AlexStore'}
                                        </div>
                                        <div className="mt-2 font-bold text-base text-rose-500">
                                            {Number(item.product.price).toLocaleString('vi-VN')}đ
                                        </div>
                                    </Link>

                                    <Button 
                                        className="w-full mt-4 flex items-center justify-center gap-2 group/btn" 
                                        disabled={item.product.stockQuantity === 0 || addToCartMutation.isPending}
                                        onClick={() => handleAddToCart(item.productId)}
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        {item.product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
