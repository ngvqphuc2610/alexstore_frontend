'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountService } from '@/services/discount.service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Ticket, Loader2, Sparkles, MapPin, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoucherCenterPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: systemVouchers = [], isLoading: loadSys } = useQuery({
        queryKey: ['public-vouchers', 'system'],
        queryFn: discountService.getPublicSystemVouchers
    });

    const { data: shopVouchers = [], isLoading: loadShop } = useQuery({
        queryKey: ['public-vouchers', 'shops', 'all'],
        queryFn: discountService.getAllPublicShopVouchers
    });

    const { data: wallet = [], isLoading: loadWallet } = useQuery({
        queryKey: ['wallet-vouchers'],
        queryFn: discountService.getWallet,
        enabled: !!user
    });

    const saveMutation = useMutation({
        mutationFn: discountService.saveVoucher,
        onSuccess: () => {
            toast.success('Lưu mã giảm giá thành công!');
            queryClient.invalidateQueries({ queryKey: ['wallet-vouchers'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const isLoading = loadSys || loadShop || loadWallet;

    const renderVoucherCard = (v: any, type: 'SYSTEM' | 'SHOP') => {
        const isSaved = Array.isArray(wallet) && wallet.some((uv: any) => uv.discountId === v.id);
        const isFullyClaimed = v.usedCount >= v.usageLimit;
        const colorClass = type === 'SYSTEM' ? 'bg-indigo-500' : 'bg-amber-500';

        return (
            <div key={v.id} className="relative bg-white border rounded-xl shadow-sm flex overflow-hidden hover:shadow-md transition-shadow">
                <div className={`w-32 shrink-0 ${colorClass} text-white p-4 flex flex-col items-center justify-center border-r-2 border-dashed border-white/50 relative`}>
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />
                    <span className="font-bold text-center text-lg leading-tight">
                        {v.type === 'PERCENTAGE' ? `Giảm ${v.value}%` : v.type === 'FREESHIP' ? 'Free\nShip' : `Giảm ${(Number(v.value)/1000)}k`}
                    </span>
                    <span className="text-[10px] mt-2 bg-white/20 px-2 py-0.5 rounded-full">{type === 'SYSTEM' ? 'AlexStore' : 'Shop'}</span>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug">{v.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Đơn Tối Thiểu {Number(v.minOrderValue).toLocaleString('vi-VN')}đ</p>
                        <div className="mt-2 text-xs font-mono text-primary bg-primary/10 inline-block px-1.5 py-0.5 rounded">
                            Mã: {v.code}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="w-1/2">
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, (v.usedCount / v.usageLimit) * 100)}%` }} />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Đã dùng {Math.min(100, Math.round((v.usedCount / v.usageLimit) * 100))}%</p>
                        </div>
                        {isSaved ? (
                            <Button size="sm" variant="outline" className="h-8 text-primary border-primary pointer-events-none">Đã lưu</Button>
                        ) : isFullyClaimed ? (
                            <Button size="sm" variant="secondary" disabled className="h-8">Hết lượt</Button>
                        ) : (
                            <Button 
                                size="sm" 
                                className="h-8 shadow-none" 
                                onClick={() => user ? saveMutation.mutate(v.id) : toast.info('Vui lòng đăng nhập để lưu mã')}
                                disabled={saveMutation.isPending}
                            >
                                {saveMutation.isPending && saveMutation.variables === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Lưu mã'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-12 px-4 shadow-inner">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-yellow-300" />
                            Trung Tâm Khuyến Mãi
                        </h1>
                        <p className="text-red-100 md:text-lg max-w-xl">
                            Săn ngay hàng ngàn mã giảm giá độc quyền từ AlexStore và các Shop yêu thích. Thêm vào ví ngay trước khi hết lượt!
                        </p>
                    </div>
                    <div className="hidden md:flex flex-col items-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                        <Ticket className="w-16 h-16 text-yellow-300 mb-2 rotate-12" />
                        <span className="font-bold">Mã mới mỗi ngày</span>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 mt-8 space-y-12">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                    <>
                        {/* System Vouchers */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <Ticket className="text-indigo-600 w-6 h-6" />
                                <h2 className="text-2xl font-bold text-gray-900">Mã Miễn Phí Vận Chuyển & Giảm Giá Sàn</h2>
                            </div>
                            {systemVouchers.length === 0 ? (
                                <div className="text-center p-8 bg-white rounded-xl border border-dashed">
                                    <p className="text-gray-500">Hiện tại sàn chưa có mã giảm giá nào mới.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {systemVouchers.map((v: any) => renderVoucherCard(v, 'SYSTEM'))}
                                </div>
                            )}
                        </section>

                        {/* Shop Vouchers */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <Store className="text-amber-600 w-6 h-6" />
                                <h2 className="text-2xl font-bold text-gray-900">Bộ Sưu Tập Mã Giảm Giá Của Shop</h2>
                            </div>
                            {shopVouchers.length === 0 ? (
                                <div className="text-center p-8 bg-white rounded-xl border border-dashed">
                                    <p className="text-gray-500">Hiện tại các Shop chưa tung ra mã giảm giá định kỳ.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {shopVouchers.map((v: any) => renderVoucherCard(v, 'SHOP'))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
