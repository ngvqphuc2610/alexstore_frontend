'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Share2, Heart, Plus, Minus, ShieldCheck, Truck, ChevronLeft, Package, RotateCcw, MessageSquare, Loader2 } from 'lucide-react';
import SellerInfoCard from '@/components/buyer/shop/SellerInfoCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { cartService } from '@/services/cart.service';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useAuthStore } from '@/stores/authStore';
import { favoritesService } from '@/services/favorites.service';
import { toast } from 'sonner';

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `/api/proxy${url}`;
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const queryClient = useQueryClient();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const { isAuthenticated } = useAuthStore();

    const { data: favorites = [] } = useQuery({
        queryKey: ['favorites'],
        queryFn: favoritesService.getFavorites,
        enabled: isAuthenticated,
    });

    const isFavorite = favorites.some((fav: any) => fav.productId === resolvedParams.id);

    const toggleFavoriteMutation = useMutation({
        mutationFn: (productId: string) => isFavorite ? favoritesService.removeFavorite(productId) : favoritesService.addFavorite(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
            toast.success(isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích');
        },
        onError: () => {
            toast.error(isAuthenticated ? 'Có lỗi xảy ra' : 'Vui lòng đăng nhập để thêm vào yêu thích');
        }
    });

    const handleToggleFavorite = () => {
        if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để thêm vào yêu thích');
            return;
        }
        toggleFavoriteMutation.mutate(resolvedParams.id);
    };

    const addToCartMutation = useMutation({
        mutationFn: () => cartService.addItem({ productId: resolvedParams.id, quantity }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Không thể thêm vào giỏ hàng. Vui lòng đăng nhập.');
        },
    });

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', resolvedParams.id],
        queryFn: () => productsService.getById(resolvedParams.id),
    });

    const addItem = useRecentlyViewedStore((state) => state.addItem);

    React.useEffect(() => {
        if (product) {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.images?.[0]?.imageUrl || null,
                categoryId: product.categoryId,
            });
        }
    }, [product, addItem]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <ShoppingBag className="h-16 w-16 text-gray-300 mb-4 mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Sản phẩm không tìm thấy</h2>
                    <p className="text-gray-500 mb-6">Sản phẩm đã bị xóa hoặc không tồn tại.</p>
                    <Button asChild>
                        <Link href="/products">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Quay về cửa hàng
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const {
        name = 'Tên không có sẵn',
        price = 0,
        avgRating = 0,
        reviewCount = 0,
        description = 'Đang cập nhật...',
        stockQuantity = 0,
        images = [],
        category,
        seller,
        reviews = [],
    } = product as any;

    const displayOriginalPrice = Number(price) * 1.2;
    const discountPercent = Math.round(((displayOriginalPrice - Number(price)) / displayOriginalPrice) * 100);

    const renderStars = (rating: number, size: string = 'h-4 w-4') => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${size} ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
                        {category && (
                            <>
                                <span>/</span>
                                <span className="text-gray-600">{category.name}</span>
                            </>
                        )}
                        <span>/</span>
                        <span className="text-gray-900 line-clamp-1 max-w-[200px] inline-block font-medium">{name}</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">

                {/* Main Product Section */}
                <Card className="border-none shadow-sm overflow-hidden mb-8">
                    <div className="flex flex-col md:flex-row p-6 lg:p-10 gap-8 lg:gap-12 bg-white">

                        {/* Gallery area */}
                        <div className="w-full md:w-1/2 flex flex-col gap-4">
                            <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 relative group">
                                {images && images.length > 0 ? (
                                    <img
                                        src={getImageUrl(images[activeImage]?.imageUrl)}
                                        alt={name}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <ShoppingBag className="h-40 w-40 text-gray-200" />
                                )}
                                {discountPercent > 0 && (
                                    <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-white font-bold text-sm px-3 py-1">
                                        -{discountPercent}%
                                    </Badge>
                                )}
                            </div>

                            {/* Thumbnail list */}
                            {images && images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {images.map((img: any, idx: number) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(idx)}
                                            className={`shrink-0 w-20 h-20 bg-gray-50 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all duration-200
                                                ${activeImage === idx ? 'border-primary shadow-md ring-1 ring-primary/20' : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300'}`}
                                        >
                                            <img src={getImageUrl(img.imageUrl)} alt="" className="object-cover w-full h-full" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info area */}
                        <div className="w-full md:w-1/2 flex flex-col">
                            {/* Category badge */}
                            {category && (
                                <Badge variant="outline" className="w-fit mb-3 text-primary border-primary/30 bg-primary/5 font-medium">
                                    {category.name}
                                </Badge>
                            )}

                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                {name}
                            </h1>

                            {/* Rating & Reviews */}
                            <div className="flex items-center gap-4 text-sm mb-6">
                                <div className="flex items-center gap-2">
                                    {renderStars(Number(avgRating))}
                                    <span className="text-gray-900 font-bold">{Number(avgRating).toFixed(1)}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-gray-500">{reviewCount} đánh giá</span>
                                {seller && (
                                    <>
                                        <Separator orientation="vertical" className="h-4" />
                                        <span className="text-gray-500">
                                            Bởi <span className="text-primary font-medium">{seller.username}</span>
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Price */}
                            <div className="bg-gradient-to-r from-gray-50 to-orange-50/30 p-6 rounded-xl mb-6">
                                <div className="flex items-end gap-3 mb-1">
                                    <span className="text-3xl font-bold text-primary">{Number(price).toLocaleString('vi-VN')}đ</span>
                                    {displayOriginalPrice > Number(price) && (
                                        <span className="text-lg text-gray-400 line-through pb-0.5">{displayOriginalPrice.toLocaleString('vi-VN')}đ</span>
                                    )}
                                    {discountPercent > 0 && (
                                        <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs mb-1">-{discountPercent}%</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Stock & Quantity */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <span className="w-24 text-gray-500 text-sm">Tình trạng:</span>
                                    {stockQuantity > 0 ? (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            <Package className="h-3 w-3 mr-1" />
                                            Còn {stockQuantity} sản phẩm
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hết hàng</Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="w-24 text-gray-500 text-sm">Số lượng:</span>
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-40"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val >= 1 && val <= stockQuantity) setQuantity(val);
                                            }}
                                            className="w-14 text-center text-sm font-medium border-x h-10 outline-none bg-white"
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                                            className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-40"
                                            disabled={quantity >= stockQuantity}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1 h-12 text-base shadow-lg shadow-primary/20 font-semibold"
                                    disabled={stockQuantity <= 0 || addToCartMutation.isPending}
                                    onClick={() => addToCartMutation.mutate()}
                                >
                                    {addToCartMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                    )}
                                    {stockQuantity > 0 ? 'Thêm vào giỏ hàng' : 'Hết Hàng'}
                                </Button>
                                
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    onClick={handleToggleFavorite}
                                    disabled={toggleFavoriteMutation.isPending}
                                    className={`h-12 px-5 transition-colors ${
                                        isFavorite 
                                            ? 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100 hover:text-rose-600 hover:border-rose-300' 
                                            : 'hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                                    }`}
                                >
                                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </Button>
                                <Button size="lg" variant="outline" className="h-12 px-5 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-colors">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Trust badges */}
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-6">
                                <div className="flex gap-3 text-sm">
                                    <Truck className="h-5 w-5 text-primary shrink-0" />
                                    <div>
                                        <strong className="block text-gray-900 text-xs">Giao hàng tận nơi</strong>
                                        <span className="text-gray-500 text-xs">Đảm bảo an toàn</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm">
                                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                                    <div>
                                        <strong className="block text-gray-900 text-xs">Chính hãng 100%</strong>
                                        <span className="text-gray-500 text-xs">Hoàn tiền nếu giả</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm">
                                    <RotateCcw className="h-5 w-5 text-primary shrink-0" />
                                    <div>
                                        <strong className="block text-gray-900 text-xs">Đổi trả 7 ngày</strong>
                                        <span className="text-gray-500 text-xs">Miễn phí đổi trả</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Seller Information Card */}
                {seller && (
                    <div className="mb-8">
                        <SellerInfoCard seller={seller} sellerId={(product as any).sellerId} />
                    </div>
                )}

                {/* Product Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Description */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 lg:p-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Chi tiết sản phẩm
                        </h2>
                        <Separator className="mb-6" />

                        {/* Product specs */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {category && (
                                <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-500 text-sm">Danh mục</span>
                                    <span className="font-medium text-sm text-gray-900">{category.name}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 text-sm">Tồn kho</span>
                                <span className="font-medium text-sm text-gray-900">{stockQuantity}</span>
                            </div>
                            <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 text-sm">Đánh giá</span>
                                <span className="font-medium text-sm text-gray-900">{Number(avgRating).toFixed(1)} / 5</span>
                            </div>
                            <div className="flex justify-between py-3 px-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-500 text-sm">Lượt đánh giá</span>
                                <span className="font-medium text-sm text-gray-900">{reviewCount}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <h3 className="font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                        <div className="prose max-w-none text-gray-600 leading-relaxed">
                            <p className="whitespace-pre-wrap">{description}</p>
                        </div>
                    </div>

                    {/* Seller info sidebar */}
                    <div className="space-y-6">
                        {seller && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    Thông tin người bán
                                </h3>
                                <Separator className="mb-4" />
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {(seller.sellerProfile?.shopName || seller.username)?.charAt(0)?.toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{seller.sellerProfile?.shopName || seller.username}</p>
                                        <p className="text-xs text-gray-500">Người bán trên AlexStore</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/shop/${(product as any).sellerId}`}>
                                        Xem cửa hàng
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Policies */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Chính sách mua hàng</h3>
                            <Separator className="mb-4" />
                            <div className="space-y-4 text-sm">
                                <div className="flex gap-3">
                                    <Truck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Miễn phí vận chuyển</p>
                                        <p className="text-gray-500 text-xs mt-0.5">Cho đơn hàng từ 500.000đ</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <RotateCcw className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Đổi trả trong 7 ngày</p>
                                        <p className="text-gray-500 text-xs mt-0.5">Đổi trả miễn phí nếu lỗi NSX</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-gray-900">Bảo hành chính hãng</p>
                                        <p className="text-gray-500 text-xs mt-0.5">12 tháng tại trung tâm bảo hành</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 lg:p-10 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Đánh giá sản phẩm
                        <span className="text-base font-normal text-gray-500">({reviewCount})</span>
                    </h2>
                    <Separator className="mb-6" />

                    {/* Rating overview */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 p-6 bg-orange-50/50 rounded-xl">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-primary">{Number(avgRating).toFixed(1)}</div>
                            <div className="mt-2">{renderStars(Number(avgRating), 'h-5 w-5')}</div>
                            <div className="text-sm text-gray-500 mt-1">{reviewCount} đánh giá</div>
                        </div>
                    </div>

                    {/* Review list */}
                    {reviews && reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review: any) => (
                                <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                                            {review.buyer?.username?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{review.buyer?.username || 'Người dùng'}</p>
                                            <div className="flex items-center gap-2">
                                                {renderStars(review.rating, 'h-3 w-3')}
                                                {review.createdAt && (
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-600 text-sm ml-[52px]">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                            <p className="text-gray-400 text-sm mt-1">Hãy là người đầu tiên đánh giá!</p>
                        </div>
                    )}
                </div>

                {/* Back to shop */}
                <div className="text-center pb-4">
                    <Button variant="outline" asChild>
                        <Link href="/products">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Tiếp tục mua sắm
                        </Link>
                    </Button>
                </div>
            </main>

        </>
    );
}
