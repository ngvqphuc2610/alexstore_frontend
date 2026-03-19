'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { CheckCircle, ShoppingBag, ArrowRight, Loader2, AlertCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('orderId');
    const orderCodeParam = searchParams.get('orderCode');

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => ordersService.getById(orderId!),
        enabled: !!orderId,
        refetchInterval: (query) => {
            const data = query.state.data as any;
            // Poll if it's an online payment and still PENDING
            if (data && data.status === 'PENDING' && data.paymentMethod !== 'COD') {
                return 3000; // 3 seconds
            }
            return false;
        }
    });

    useEffect(() => {
        if (order && order.status === 'PENDING' && order.paymentMethod !== 'COD') {
            const createdAt = new Date(order.createdAt).getTime();
            const now = new Date().getTime();
            const expireTime = createdAt + 15 * 60 * 1000;
            const diff = expireTime - now;
            
            if (diff > 0) {
                setTimeLeft(diff);
                const timer = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev && prev > 1000) return prev - 1000;
                        clearInterval(timer);
                        return 0; // Expired
                    });
                }, 1000);
                return () => clearInterval(timer);
            } else {
                setTimeLeft(0);
            }
        }
    }, [order]);

    // Format mm:ss
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isCOD = order?.paymentMethod === 'COD';
    const isPending = order?.status === 'PENDING';
    const isPaid = order?.status === 'PAID';
    const isExpired = timeLeft === 0;

    return (
        <>
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Trạng thái đơn hàng</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Card className="border border-gray-100 shadow-sm overflow-hidden">
                        <div className={`p-8 text-center text-white ${
                            isPending && !isExpired && !isCOD ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                            (isExpired && !isCOD) || order?.status === 'CANCELLED' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                            'bg-gradient-to-br from-emerald-500 to-emerald-600'
                        }`}>
                            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                {isPending && !isExpired && !isCOD ? <Clock className="h-10 w-10 text-white" /> :
                                 (isExpired && !isCOD) || order?.status === 'CANCELLED' ? <AlertCircle className="h-10 w-10 text-white" /> :
                                 <CheckCircle className="h-10 w-10 text-white" />}
                            </div>
                            <h1 className="text-2xl font-bold mb-2">
                                {isPending && !isExpired && !isCOD ? 'Chờ thanh toán' :
                                 (isExpired && !isCOD) || order?.status === 'CANCELLED' ? 'Đơn hàng đã hủy' :
                                 'Đặt hàng thành công! 🎉'}
                            </h1>
                            <p className="text-white/80 text-sm">
                                {isPending && !isExpired && !isCOD ? 'Vui lòng hoàn tất quá trình thanh toán' :
                                 (isExpired && !isCOD) || order?.status === 'CANCELLED' ? 'Đã quá hạn hoặc bị hủy thanh toán' :
                                 isPaid ? 'Thanh toán đã được xác nhận thành công' : 'Cảm ơn bạn đã mua sắm tại AlexStore'}
                            </p>
                        </div>

                        <CardContent className="p-8">
                            {(order?.orderCode || orderCodeParam) && (
                                <div className="bg-gray-50 rounded-xl p-5 mb-6 text-center">
                                    <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                                    <p className="text-lg font-bold text-gray-900 font-mono tracking-wide">
                                        {order?.orderCode || orderCodeParam}
                                    </p>
                                </div>
                            )}

                            {isPending && !isExpired && timeLeft !== null && !isCOD && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
                                    <p className="text-sm text-amber-800 mb-2 font-medium">Thời gian thanh toán còn lại:</p>
                                    <p className="text-3xl font-bold text-amber-600 font-mono">{formatTime(timeLeft)}</p>
                                    <p className="text-xs text-amber-700 mt-2">
                                        Sau thời gian này, hệ thống sẽ tự động hủy đơn và hoàn lại sản phẩm về kho.
                                    </p>
                                </div>
                            )}

                            {((!isPending || isExpired) || isCOD) && (
                                <div className="space-y-3 text-sm text-gray-600 mb-6">
                                    <p>
                                        {(isExpired && !isCOD) || order?.status === 'CANCELLED' 
                                            ? '❌ Rất tiếc, đơn đặt hàng này đã bị hủy do chưa được thanh toán thành công.' 
                                            : isPaid 
                                                ? '✅ Thanh toán của bạn đã được xác nhận. Đơn hàng đang được chuẩn bị.'
                                                : '✅ Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.'}
                                    </p>
                                    <p>📧 Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".</p>
                                    <p>📞 Nếu cần hỗ trợ, vui lòng liên hệ bộ phận CSKH.</p>
                                </div>
                            )}

                            <Separator className="my-6" />

                            <div className="space-y-3">
                                {isPending && !isExpired && !isCOD && (
                                    <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white" asChild>
                                        <Link href="/profile/orders">
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Đến trang thanh toán
                                        </Link>
                                    </Button>
                                )}
                                <Button className="w-full h-11" variant={isPending && !isExpired && !isCOD ? 'outline' : 'default'} asChild>
                                    <Link href="/profile/orders">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Xem chi tiết đơn hàng
                                    </Link>
                                </Button>
                                <Button variant={isPending && !isExpired && !isCOD ? 'ghost' : 'outline'} className="w-full h-11" asChild>
                                    <Link href="/products">
                                        <ShoppingBag className="h-4 w-4 mr-2" />
                                        Tiếp tục mua sắm
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
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
