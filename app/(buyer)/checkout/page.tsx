'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ShoppingBag, MapPin, CreditCard, Truck, ShieldCheck,
    ArrowRight, ChevronLeft, Loader2, Wallet, Smartphone,
    Banknote, CheckCircle2, Ticket, Sparkles, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { ordersService } from '@/services/orders.service';
import { usersService } from '@/services/users.service';
import { addressService } from '@/services/address.service';
import { discountService } from '@/services/discount.service';
import { toast } from 'sonner';
import type { CartItem } from '@/types';
import type { Address } from '@/types/address.types';

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `/api/proxy${url}`;
};

const PAYMENT_METHODS = [
    {
        id: 'COD',
        name: 'Thanh toán khi nhận hàng (COD)',
        description: 'Trả tiền mặt khi nhận được hàng',
        icon: Banknote,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-300',
    },
    {
        id: 'VNPAY',
        name: 'VNPay',
        description: 'Thanh toán qua cổng VNPay (ATM/Visa/QR)',
        icon: CreditCard,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
    },
    {
        id: 'MOMO',
        name: 'Ví MoMo',
        description: 'Thanh toán qua ví điện tử MoMo',
        icon: Smartphone,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-300',
    },
];

export default function CheckoutPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
    
    // Voucher selection state (IDs of UserVoucher)
    const [selectedShopVoucher, setSelectedShopVoucher] = useState<string | null>(null);
    const [selectedPlatformVoucher, setSelectedPlatformVoucher] = useState<string | null>(null);
    const [selectedFreeshipVoucher, setSelectedFreeshipVoucher] = useState<string | null>(null);

    // Fetch cart
    const { data: cart, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: cartService.getCart,
    });

    // Fetch user profile for saved address
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: usersService.getProfile,
    });

    // Fetch user addresses
    const { data: addresses = [], isLoading: addressesLoading } = useQuery({
        queryKey: ['addresses'],
        queryFn: () => addressService.getAll()
    });

    // Fetch user wallet for vouchers
    const { data: vouchersData = [], isLoading: vouchersLoading } = useQuery({
        queryKey: ['wallet-vouchers'],
        queryFn: discountService.getWallet,
    });

    // Pre-select default address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = addresses.find(a => a.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            } else {
                setSelectedAddressId(addresses[0].id);
            }
        }
    }, [addresses, selectedAddressId]);

    const items: CartItem[] = cart?.items || [];
    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        [items]
    );

    const savedVouchers = Array.isArray(vouchersData) ? vouchersData.filter(v => v.status === 'SAVED') : [];
    
    // Helper to calculate exact discount amount of a voucher against a given base price
    const calculateDiscountAmount = (discount: any, basePrice: number) => {
        if (!discount) return 0;
        if (Number(discount.minOrderValue) > basePrice) return 0;
        
        let amount = 0;
        if (discount.type === 'PERCENTAGE') {
            amount = basePrice * (Number(discount.value) / 100);
            if (discount.maxDiscountAmount && amount > Number(discount.maxDiscountAmount)) {
                amount = Number(discount.maxDiscountAmount);
            }
        } else if (discount.type === 'FIXED_AMOUNT') {
            amount = Number(discount.value);
        } else if (discount.type === 'FREESHIP') {
            amount = Number(discount.value); // Usually caps the shipping speed
        }
        return amount;
    };

    // Calculate active discounts
    const activeShopUv = savedVouchers.find(v => v.id === selectedShopVoucher);
    const activePlatformUv = savedVouchers.find(v => v.id === selectedPlatformVoucher);
    const activeFreeshipUv = savedVouchers.find(v => v.id === selectedFreeshipVoucher);

    const shopDiscountValue = activeShopUv ? calculateDiscountAmount(activeShopUv.discount, subtotal) : 0;
    const platformDiscountValue = activePlatformUv ? calculateDiscountAmount(activePlatformUv.discount, Math.max(0, subtotal - shopDiscountValue)) : 0;

    const baseShippingFee = subtotal >= 500000 ? 0 : 30000;
    const freeshipDiscountValue = activeFreeshipUv && baseShippingFee > 0
        ? Math.min(baseShippingFee, calculateDiscountAmount(activeFreeshipUv.discount, subtotal)) 
        : 0;

    const shippingFee = baseShippingFee - freeshipDiscountValue;
    const total = Math.max(0, subtotal - shopDiscountValue - platformDiscountValue) + shippingFee;

    // Greedy Algorithm for Best Deal
    const autoApplyBestDeal = () => {
        let bestShop = null, bestPlatform = null, bestFreeship = null;
        let maxShopVal = 0, maxPlatformVal = 0, maxFreeshipVal = 0;

        savedVouchers.forEach(uv => {
            const d = uv.discount;
            if (Number(d.minOrderValue) > subtotal) return;

            if (d.type === 'FREESHIP') {
                const val = Math.min(30000, Number(d.value)); // Simplified freeship estimation
                if (val > maxFreeshipVal) { maxFreeshipVal = val; bestFreeship = uv.id; }
            } else if (d.scope === 'SHOP') {
                const val = calculateDiscountAmount(d, subtotal);
                if (val > maxShopVal) { maxShopVal = val; bestShop = uv.id; }
            }
        });

        // Platform is calculated post shop discount
        const tempSubAfterShop = subtotal - maxShopVal;
        savedVouchers.forEach(uv => {
            const d = uv.discount;
            if (Number(d.minOrderValue) > subtotal || d.scope !== 'PLATFORM' || d.type === 'FREESHIP') return;
            const val = calculateDiscountAmount(d, tempSubAfterShop);
            if (val > maxPlatformVal) { maxPlatformVal = val; bestPlatform = uv.id; }
        });

        setSelectedShopVoucher(bestShop);
        setSelectedPlatformVoucher(bestPlatform);
        setSelectedFreeshipVoucher(bestFreeship);
        toast.info('Đã tự động áp dụng các mã giảm giá tốt nhất!');
    };

    const getAppliedVoucherIds = () => {
        return [selectedShopVoucher, selectedPlatformVoucher, selectedFreeshipVoucher].filter(Boolean) as string[];
    };

    // Place order mutation
    const placeOrderMutation = useMutation({
        mutationFn: async () => {
            if (!selectedAddressId) {
                throw new Error('Vui lòng chọn địa chỉ giao hàng');
            }

            // Place the order
            return ordersService.placeOrder({
                addressId: selectedAddressId,
                paymentMethod,
                appliedVouchers: getAppliedVoucherIds(),
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
            });
        },
        onSuccess: async (order) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            if (paymentMethod === 'VNPAY') {
                try {
                    const { paymentService } = await import('@/services/payment.service');
                    const res = await paymentService.createVNPayUrl(order.id);
                    window.location.href = res.url;
                } catch (error) {
                    toast.error('Có lỗi xảy ra khi tạo mã thanh toán VNPay');
                    router.push(`/checkout/success?orderId=${order.id}&orderCode=${order.orderCode}`);
                }
            } else if (paymentMethod === 'MOMO') {
                try {
                    const { paymentService } = await import('@/services/payment.service');
                    const res = await paymentService.createMoMoUrl(order.id);
                    window.location.href = res.url;
                } catch (error) {
                    toast.error('Có lỗi xảy ra khi tạo mã thanh toán MoMo');
                    router.push(`/checkout/success?orderId=${order.id}&orderCode=${order.orderCode}`);
                }
            } else {
                toast.success('Đặt hàng thành công!');
                router.push(`/checkout/success?orderId=${order.id}&orderCode=${order.orderCode}`);
            }
        },
        onError: (err: any) => {
            toast.error(err.message || 'Không thể đặt hàng. Vui lòng thử lại.');
        },
    });

    const isLoading = cartLoading || profileLoading || addressesLoading || vouchersLoading;

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <ShoppingBag className="h-20 w-20 text-gray-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                    <p className="text-gray-500 mb-6">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                    <Button asChild>
                        <Link href="/products">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Mua sắm ngay
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link href="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Thanh toán</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Forms */}
                    <div className="flex-1 space-y-6">

                        {/* Shipping Address */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Địa chỉ giao hàng
                                    </h2>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/profile/addresses">Quản lý địa chỉ</Link>
                                    </Button>
                                </div>
                                
                                {addresses.length === 0 ? (
                                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-500 mb-3">Bạn chưa có địa chỉ giao hàng nào.</p>
                                        <Button asChild size="sm">
                                            <Link href="/profile/addresses">Thêm địa chỉ ngay</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <div 
                                                key={addr.id}
                                                onClick={() => setSelectedAddressId(addr.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    selectedAddressId === addr.id 
                                                        ? 'border-indigo-600 bg-indigo-50/50' 
                                                        : 'border-gray-100 hover:border-indigo-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                                                        selectedAddressId === addr.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                                                    }`}>
                                                        {selectedAddressId === addr.id && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-gray-900">{addr.fullName}</span>
                                                            <div className="w-px h-3 bg-gray-300"></div>
                                                            <span className="text-gray-600 text-sm">{addr.phoneNumber}</span>
                                                            {addr.isDefault && (
                                                                <Badge variant="outline" className="ml-2 text-indigo-600 bg-indigo-50 border-indigo-200 text-[10px] h-5 px-1.5">
                                                                    Mặc định
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 truncate">{addr.addressLine}, {addr.ward}</p>
                                                        <p className="text-sm text-gray-600 truncate">{addr.district}, {addr.province}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {!selectedAddressId && addresses.length > 0 && (
                                    <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                                        <span>⚠️</span> Vui lòng chọn địa chỉ giao hàng
                                    </p>
                                )}
                            </CardContent>
                        </Card>


                        {/* Payment Method */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-primary" />
                                    Phương thức thanh toán
                                </h2>
                                <div className="space-y-3">
                                    {PAYMENT_METHODS.map((method) => {
                                        const Icon = method.icon;
                                        const isSelected = paymentMethod === method.id;
                                        return (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                                                    ${isSelected
                                                        ? `${method.borderColor} ${method.bgColor} shadow-sm`
                                                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? method.bgColor : 'bg-gray-100'}`}>
                                                    <Icon className={`h-6 w-6 ${isSelected ? method.color : 'text-gray-400'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {method.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                                                </div>
                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                                    ${isSelected ? `${method.borderColor}` : 'border-gray-300'}`}>
                                                    {isSelected && (
                                                        <div className={`h-2.5 w-2.5 rounded-full ${method.color.replace('text-', 'bg-')}`}></div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {paymentMethod !== 'COD' && (
                                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                        <p className="text-xs text-amber-700 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 shrink-0" />
                                            Thanh toán {paymentMethod === 'VNPAY' ? 'VNPay' : 'MoMo'} sẽ được xử lý sau khi đặt hàng thành công. Đơn hàng sẽ ở trạng thái chờ thanh toán.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items Preview */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    Sản phẩm đặt mua ({items.length})
                                </h2>
                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const primaryImage = item.product.images?.find(img => img.isPrimary) || item.product.images?.[0];
                                        return (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                                                    {primaryImage ? (
                                                        <img
                                                            src={getImageUrl(primaryImage.imageUrl)}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag className="h-6 w-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">SL: {item.quantity}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-sm text-gray-900">
                                                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-xs text-gray-400">{item.product.price.toLocaleString('vi-VN')}đ/sp</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Back */}
                        <div className="pt-2">
                            <Button variant="outline" asChild>
                                <Link href="/cart">
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Quay lại giỏ hàng
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        {/* Vouchers Section */}
                        <Card className="border border-gray-100 shadow-sm mb-6">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Ticket className="h-5 w-5 text-amber-500" /> AlexStore Voucher
                                    </h2>
                                </div>
                                <div className="space-y-2">
                                    {getAppliedVoucherIds().length > 0 ? (
                                        <div className="flex flex-col gap-2 mb-4">
                                            {activeShopUv && <Badge variant="secondary" className="justify-between py-1.5 px-3 bg-amber-50 text-amber-700 border border-amber-200">Shop: {activeShopUv.discount.code} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSelectedShopVoucher(null)}/></Badge>}
                                            {activePlatformUv && <Badge variant="secondary" className="justify-between py-1.5 px-3 bg-indigo-50 text-indigo-700 border border-indigo-200">Sàn: {activePlatformUv.discount.code} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSelectedPlatformVoucher(null)}/></Badge>}
                                            {activeFreeshipUv && <Badge variant="secondary" className="justify-between py-1.5 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200">Freeship: {activeFreeshipUv.discount.code} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSelectedFreeshipVoucher(null)}/></Badge>}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 mb-4">Chọn hoặc nhập mã khuyến mãi</p>
                                    )}
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 border-dashed" onClick={() => setVoucherDialogOpen(true)}>
                                            <Ticket className="w-4 h-4 mr-2" /> Chọn mã
                                        </Button>
                                        <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={autoApplyBestDeal}>
                                            <Sparkles className="w-4 h-4 mr-2" /> Tự động
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Summary */}
                        <Card className="border border-gray-100 shadow-sm sticky top-24">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-5">Tóm tắt đơn hàng</h2>
                                <Separator className="mb-5" />

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tạm tính ({items.length} sp)</span>
                                        <span className="font-medium text-gray-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    {shopDiscountValue > 0 && (
                                        <div className="flex justify-between text-amber-600">
                                            <span>Giảm giá Shop</span>
                                            <span className="font-medium">- {shopDiscountValue.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    {platformDiscountValue > 0 && (
                                        <div className="flex justify-between text-indigo-600">
                                            <span>Giảm giá AlexStore</span>
                                            <span className="font-medium">- {platformDiscountValue.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Phí vận chuyển</span>
                                        {baseShippingFee === 0 ? (
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs" variant="outline">Miễn phí</Badge>
                                        ) : (
                                            <span className="font-medium text-gray-900">{baseShippingFee.toLocaleString('vi-VN')}đ</span>
                                        )}
                                    </div>
                                    {freeshipDiscountValue > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Hỗ trợ vận chuyển</span>
                                            <span className="font-medium">- {freeshipDiscountValue.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-gray-500">Thanh toán</span>
                                        <Badge variant="outline" className="text-xs">
                                            {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-5" />

                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-gray-900 text-base">Tổng cộng</span>
                                    <span className="font-bold text-primary text-xl">{total.toLocaleString('vi-VN')}đ</span>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                                    disabled={!selectedAddressId || placeOrderMutation.isPending}
                                    onClick={() => placeOrderMutation.mutate()}
                                >
                                    {placeOrderMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5 mr-2" />
                                            Đặt hàng
                                        </>
                                    )}
                                </Button>

                                {/* Trust badges */}
                                <div className="mt-6 space-y-3 pt-5 border-t">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                        <span>Thanh toán an toàn & bảo mật</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <Truck className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span>Giao hàng nhanh toàn quốc</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Voucher Selection Dialog */}
            <Dialog open={voucherDialogOpen} onOpenChange={setVoucherDialogOpen}>
                <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Chọn AlexStore Voucher</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-2 pb-6 space-y-4">
                        {savedVouchers.map((uv: any) => {
                            const d = uv.discount;
                            const isEligible = Number(d.minOrderValue) <= subtotal;
                            const isSelected = selectedShopVoucher === uv.id || selectedPlatformVoucher === uv.id || selectedFreeshipVoucher === uv.id;
                            
                            return (
                                <div 
                                    key={uv.id} 
                                    className={`flex border rounded-xl overflow-hidden shadow-sm relative cursor-pointer transition-all ${
                                        !isEligible ? 'opacity-50 grayscale bg-gray-50' : 
                                        isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50'
                                    }`}
                                    onClick={() => {
                                        if (!isEligible) return;
                                        if (d.type === 'FREESHIP') {
                                            setSelectedFreeshipVoucher(isSelected ? null : uv.id);
                                        } else if (d.scope === 'SHOP') {
                                            setSelectedShopVoucher(isSelected ? null : uv.id);
                                        } else {
                                            setSelectedPlatformVoucher(isSelected ? null : uv.id);
                                        }
                                    }}
                                >
                                    <div className={`w-24 shrink-0 flex flex-col justify-center items-center text-white p-3 border-r-2 border-dashed ${d.scope === 'PLATFORM' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                                        <span className="font-bold text-center text-sm">
                                            {d.type === 'PERCENTAGE' ? `Giảm ${d.value}%` : d.type === 'FREESHIP' ? 'Free\nShip' : `Giảm ${Number(d.value).toLocaleString('vi-VN')}đ`}
                                        </span>
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900 text-sm">{d.name}</h3>
                                            <div className="shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center">
                                                {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu {Number(d.minOrderValue).toLocaleString('vi-VN')}đ</p>
                                        {!isEligible && (
                                            <p className="text-xs text-red-500 mt-1 font-medium">Mua thêm {(Number(d.minOrderValue) - subtotal).toLocaleString('vi-VN')}đ để sử dụng</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="p-6 border-t bg-gray-50 shrink-0">
                        <Button className="w-full" onClick={() => setVoucherDialogOpen(false)}>Xác nhận</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
