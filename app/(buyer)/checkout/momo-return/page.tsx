'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { paymentService } from '@/services/payment.service';

function MoMoReturnContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [orderCode, setOrderCode] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const queryString = window.location.search;
                if (!queryString) {
                    setStatus('error');
                    setMessage('Không tìm thấy thông tin thanh toán MoMo.');
                    return;
                }

                const res = await paymentService.verifyMoMo(queryString);

                if (res.code === '0') {
                    setStatus('success');
                    setOrderCode(res.orderCode);
                } else {
                    setStatus('error');
                    setMessage(res.message || 'Thanh toán qua MoMo thất bại.');
                    if (res.orderCode) setOrderCode(res.orderCode);
                }
            } catch (error) {
                setStatus('error');
                setMessage('Lỗi kết nối khi xác thực thanh toán MoMo.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <main className="flex-1 container mx-auto px-4 py-12 max-w-xl">
            <Card className="border border-gray-100 shadow-sm overflow-hidden">
                {status === 'loading' && (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                        <h2 className="text-xl font-medium text-gray-900">Đang xác thực thanh toán MoMo...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <>
                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 text-center text-white">
                            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <CheckCircle className="h-10 w-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Thanh toán MoMo thành công!</h1>
                        </div>

                        <CardContent className="p-8 text-center">
                            {orderCode && (
                                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                                    <p className="text-xs text-gray-500 mb-1">Mã đơn hàng</p>
                                    <p className="text-lg font-bold text-gray-900 font-mono tracking-wide">{orderCode}</p>
                                </div>
                            )}

                            <Separator className="my-6" />

                            <div className="space-y-3">
                                <Button className="w-full h-11 bg-pink-600 hover:bg-pink-700" asChild>
                                    <Link href="/products">Tiếp tục mua sắm</Link>
                                </Button>
                                <Button variant="outline" className="w-full h-11 border-pink-200 text-pink-600 hover:bg-pink-50" asChild>
                                    <Link href="/">Về trang chủ</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 text-center text-white">
                            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <XCircle className="h-10 w-10 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Thanh toán không thành công</h1>
                            <p className="text-red-100 text-sm">{message}</p>
                        </div>

                        <CardContent className="p-8 text-center">
                            <Button className="w-full h-11" asChild>
                                <Link href="/cart">Quay lại giỏ hàng</Link>
                            </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </main>
    );
}

export default function MoMoReturnPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>}>
            <MoMoReturnContent />
        </Suspense>
    );
}
