'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Ticket, Loader2 } from 'lucide-react';
import { discountService } from '@/services/discount.service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export function VoucherClaimWidget({ shopId }: { shopId?: string }) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    // Fetch public platform vouchers
    const { data: systemVouchers = [], isLoading: loadingSys } = useQuery({
        queryKey: ['public-vouchers', 'system'],
        queryFn: discountService.getPublicSystemVouchers,
    });

    // Fetch public shop vouchers if shopId exists
    const { data: shopVouchers = [], isLoading: loadingShop } = useQuery({
        queryKey: ['public-vouchers', 'shop', shopId],
        queryFn: () => discountService.getPublicShopVouchers(shopId!),
        enabled: !!shopId,
    });

    // Fetch user wallet to know which ones are already saved
    const { data: wallet = [], isLoading: loadingWallet } = useQuery({
        queryKey: ['wallet-vouchers'],
        queryFn: discountService.getWallet,
        enabled: !!user,
    });

    const saveMutation = useMutation({
        mutationFn: discountService.saveVoucher,
        onSuccess: () => {
            toast.success('Lưu voucher thành công!');
            queryClient.invalidateQueries({ queryKey: ['wallet-vouchers'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Có lỗi khi lưu voucher');
        }
    });

    const allVouchers = [...(Array.isArray(systemVouchers) ? systemVouchers : []), ...(Array.isArray(shopVouchers) ? shopVouchers : [])];
    const isLoading = loadingSys || loadingShop || loadingWallet;

    // Filter out already saved or unavailable
    const availableVouchers = allVouchers.filter((v: any) => {
        const saved = Array.isArray(wallet) ? wallet.find((uv: any) => uv.discountId === v.id) : null;
        if (saved) return false; // Already saved
        if (v.usedCount >= v.usageLimit) return false; // Fully claimed
        return true;
    });

    if (allVouchers.length === 0) return null; // No vouchers at all to show

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors font-medium border border-indigo-100 shadow-sm mt-3">
                    <Ticket className="w-4 h-4" />
                    Lấy mã giảm giá
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="font-bold gap-2 flex items-center text-gray-900">
                        <Ticket className="w-4 h-4 text-primary" /> Vouchers có thể lấy
                    </h3>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto space-y-3">
                    {!user && (
                        <p className="text-xs text-center text-amber-600 mb-3 bg-amber-50 p-2 rounded">
                            Vui lòng đăng nhập để lưu mã giảm giá
                        </p>
                    )}
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                    ) : availableVouchers.length === 0 ? (
                        <p className="text-sm text-center text-gray-500 py-4">Bạn đã lưu tất cả mã hiện có.</p>
                    ) : (
                        availableVouchers.map((v: any) => (
                            <div key={v.id} className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between gap-3 hover:border-indigo-200 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-sm text-gray-900 truncate" title={v.name}>{v.name}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-0.5">Đơn Tối Thiểu {Number(v.minOrderValue).toLocaleString('vi-VN')}đ</p>
                                    <p className="text-[10px] font-mono mt-1 text-primary bg-primary/10 px-1 inline-block rounded">{v.code}</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="h-8 shadow-none shrink-0" 
                                    disabled={!user || saveMutation.isPending}
                                    onClick={() => saveMutation.mutate(v.id)}
                                >
                                    {saveMutation.isPending && saveMutation.variables === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Lưu'}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
