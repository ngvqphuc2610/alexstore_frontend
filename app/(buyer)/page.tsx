'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center bg-gray-900 border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10"></div>
        {/* A placeholder for an image background */}
        <div className="absolute inset-0 z-0 bg-zinc-900 flex items-center justify-end overflow-hidden">
          <div className="w-1/2 h-full bg-primary/20 transform skew-x-12 translate-x-32 scale-150"></div>
        </div>
        <div className="container relative z-20 mx-auto px-4 lg:px-8">
          <div className="max-w-xl text-white space-y-6">
            <span className="inline-block px-3 py-1 bg-primary text-xs font-bold uppercase rounded-md tracking-wider">
              Mùa Khuyến Mãi 2026
            </span>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight drop-shadow-md">
              Khám phá thế giới <br /> của riêng bạn
            </h1>
            <p className="text-lg text-gray-300">
              Sản phẩm chất lượng cao với dịch vụ khách hàng từ tâm. Mua sắm tự tin tại AlexStore.
            </p>
            <div className="flex gap-4 pt-4">
              <Button size="lg" asChild className="h-12 px-8 text-base">
                <Link href="/products" className="gap-2">
                  Mua ngay <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base text-gray-900 hover:text-white hover:bg-white/10 bg-white">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features / Guarantees Setup */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-none bg-gray-50 flex flex-row items-center p-6 gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Giao hàng miễn phí</h3>
                <p className="text-sm text-gray-500">Cho tất cả hóa đơn trên 500k</p>
              </div>
            </Card>
            <Card className="border-none shadow-none bg-gray-50 flex flex-row items-center p-6 gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Đổi trả 30 ngày</h3>
                <p className="text-sm text-gray-500">Chính sách đổi trả dễ dàng</p>
              </div>
            </Card>
            <Card className="border-none shadow-none bg-gray-50 flex flex-row items-center p-6 gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Bảo mật thanh toán</h3>
                <p className="text-sm text-gray-500">Bảo mật giao dịch 100%</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Bestsellers Placeholder */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Thịnh Hành Nhất</h2>
              <p className="text-gray-500 mt-2">Các sản phẩm được mua nhiều nhất tuần qua</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex text-primary hover:text-primary/80">
              <Link href="/products" className="gap-2">Xem tất cả <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {/* Product Dummy Loop */}
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="group overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform duration-500">
                    <ShoppingBag className="h-16 w-16 opacity-20" />
                  </div>
                  {i === 1 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">HOT</span>}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" className="bg-white text-gray-900 hover:bg-white shadow">Xem nhanh</Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2 text-yellow-400">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-current" />)}
                    <span className="text-[10px] text-gray-400 ml-1">(120)</span>
                  </div>
                  <Link href={'/product/' + i} className="font-medium text-gray-900 hover:text-primary line-clamp-1">
                    Sản phẩm Mẫu Premium {i}
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-primary">890.000đ</span>
                    <span className="text-xs text-gray-400 line-through">1.200.000đ</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/products">Xem tất cả</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}
