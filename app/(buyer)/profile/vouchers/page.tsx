'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { discountService } from '@/services/discount.service';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket, Percent, Search, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VouchersPage() {
    const [search, setSearch] = useState('');
    const { data: vouchers = [], isLoading } = useQuery({
        queryKey: ['wallet-vouchers'],
        queryFn: discountService.getWallet,
    });

    const filtered = (Array.isArray(vouchers) ? vouchers : []).filter(
        (v: any) => v.discount?.name?.toLowerCase().includes(search.toLowerCase()) || 
             v.discount?.code?.toLowerCase().includes(search.toLowerCase())
    );

    const saved = filtered.filter((v: any) => v.status === 'SAVED');
    const used = filtered.filter((v: any) => v.status === 'USED');
    const expired = filtered.filter((v: any) => v.status === 'EXPIRED');

    const renderVoucherCard = (uv: any) => {
        const d = uv.discount;
        const isPercentage = d.type === 'PERCENTAGE';
        const isFreeship = d.type === 'FREESHIP';
        const isPlatform = d.scope === 'PLATFORM';
        
        return (
            <div key={uv.id} className={`flex border rounded-xl overflow-hidden shadow-sm relative ${uv.status !== 'SAVED' ? 'opacity-60 grayscale' : 'hover:shadow-md transition-shadow'}`}>
                {/* Left ticket stub */}
                <div className={`w-28 shrink-0 flex flex-col justify-center items-center text-white p-4 border-r-2 border-dashed ${isPlatform ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                    {isFreeship ? <Ticket className="w-8 h-8 mb-2 opacity-80" /> : <Percent className="w-8 h-8 mb-2 opacity-80" />}
                    <span className="font-bold text-center leading-tight">
                        {isPercentage ? `Giảm ${d.value}%` : isFreeship ? 'Miễn phí\nVận chuyển' : `Giảm ${Number(d.value).toLocaleString('vi-VN')}đ`}
                    </span>
                </div>
                {/* Right content */}
                <div className="flex-1 p-4 bg-white flex flex-col justify-center relative">
                    <div className="flex justify-between items-start mb-1">
                        <Badge variant="outline" className={`mb-2 ${isPlatform ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : 'text-amber-600 border-amber-200 bg-amber-50'}`}>
                            {isPlatform ? 'AlexStore' : 'Shop'}
                        </Badge>
                        <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-sm">{d.code}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 leading-snug line-clamp-1" title={d.name}>{d.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Cho đơn từ {Number(d.minOrderValue).toLocaleString('vi-VN')}đ
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        HSD: {new Date(d.endDate).toLocaleDateString('vi-VN')}
                    </div>
                </div>
                {/* Hole punch effects to look like a ticket */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white rounded-full -translate-y-1/2 border-r border-gray-200 shadow-inner"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full -translate-y-1/2 border-l border-gray-200 shadow-inner"></div>
            </div>
        );
    };

    return (
        <React.Fragment> {/* ProfileLayout doesn't need to wrap directly initially if it causes issues, but we'll use it */}
        <ProfileLayout>
            <Card className="border-0 shadow-sm min-h-[600px]">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-indigo-600" /> Kho Voucher
                    </CardTitle>
                    <CardDescription>Quản lý các mã giảm giá bạn đã lưu</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Tìm kiếm theo mã hoặc tên voucher..." 
                            className="pl-9 bg-gray-50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Tabs defaultValue="saved">
                        <TabsList className="mb-6">
                            <TabsTrigger value="saved">Chưa sử dụng ({saved.length})</TabsTrigger>
                            <TabsTrigger value="used">Đã sử dụng ({used.length})</TabsTrigger>
                            <TabsTrigger value="expired">Đã hết hạn ({expired.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="saved">
                            {isLoading ? (
                                <div className="text-center py-12 text-gray-400">Đang tải...</div>
                            ) : saved.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">Không có voucher nào.</div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {saved.map(renderVoucherCard)}
                                </div>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="used">
                            {used.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">Không có voucher nào.</div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {used.map(renderVoucherCard)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="expired">
                            {expired.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">Không có voucher nào.</div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {expired.map(renderVoucherCard)}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </ProfileLayout>
        </React.Fragment>
    );
}
