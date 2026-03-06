'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ShoppingBag, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderCode = searchParams.get('orderCode') || '';

    return (
        <>
            {/* Breadcrumb */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Đặt hàng thành công</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
                <Card className="border border-gray-100 shadow-sm overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white">
                        <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công! 🎉</h1>
                        <p className="text-emerald-100 text-sm">Cảm ơn bạn đã mua sắm tại AlexStore</p>
                    </div>

                    <CardContent className="p-8">
                        {/* Order Info */}
                        {orderCode && (
                            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-center">
                                <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                                <p className="text-lg font-bold text-gray-900 font-mono tracking-wide">{orderCode}</p>
                            </div>
                        )}

                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <p>✅ Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.</p>
                            <p>📧 Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".</p>
                            <p>📞 Nếu cần hỗ trợ, vui lòng liên hệ bộ phận CSKH.</p>
                        </div>

                        <Separator className="my-6" />

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button className="w-full h-11" asChild>
                                <Link href="/products">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Tiếp tục mua sắm
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full h-11" asChild>
                                <Link href="/">
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Về trang chủ
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
