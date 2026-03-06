'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Users, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
    return (
        <>
            {/* Breakcrumb */}
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Giới thiệu</span>
                    </div>
                </div>
            </div>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 bg-primary/5">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-6" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            Về AlexStore
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            AlexStore là một nền tảng thương mại điện tử hiện đại, kết nối người mua và người bán trên toàn quốc.
                            Chúng tôi cam kết mang đến trải nghiệm mua sắm và bán hàng trực tuyến an toàn, tiện lợi và nhanh chóng nhất.
                        </p>
                    </div>
                </section>

                {/* Core Values */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">Chúng tôi luôn đặt lợi ích của khách hàng và đối tác lên hàng đầu thông qua ba cam kết vững chắc.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow">
                                <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Users className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Cộng đồng tin cậy</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Xây dựng một môi trường mua bán công bằng, minh bạch giữa người mua và các nhà bán hàng được xác thực.
                                </p>
                            </div>

                            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Thanh toán an toàn</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Hỗ trợ đa dạng phương thức thanh toán như COD, VNPay, MoMo với quy trình bảo mật cao nhất hiện nay.
                                </p>
                            </div>

                            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow">
                                <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Truck className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Giao hàng tốc hành</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Mạng lưới vận chuyển rộng khắp, đảm bảo hàng hóa đến tay khách hàng trong thời gian ngắn nhất.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-20 bg-gray-900 text-white">
                    <div className="container mx-auto px-4 text-center max-w-2xl">
                        <h2 className="text-3xl font-bold mb-6">Bắt đầu trải nghiệm ngay hôm nay</h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Hàng ngàn sản phẩm chất lượng đang chờ đón bạn. Tham gia cộng đồng AlexStore để nhận những ưu đãi tốt nhất!
                        </p>
                        <Button size="lg" className="h-12 px-8 bg-primary text-white hover:bg-primary/90 text-base" asChild>
                            <Link href="/products">
                                Khám phá sản phẩm <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
