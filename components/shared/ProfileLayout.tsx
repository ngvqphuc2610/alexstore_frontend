'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, ShoppingBag, Settings, Bell, Shield, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';

interface SidebarItem {
    label: string;
    href: string;
    icon: React.ElementType;
    roles: string[];
}

const sidebarItems: SidebarItem[] = [
    { label: 'Hồ sơ', href: '/profile', icon: User, roles: ['BUYER'] },
    { label: 'Hồ sơ', href: '/seller/profile', icon: User, roles: ['SELLER'] },
    { label: 'Hồ sơ', href: '/admin/profile', icon: User, roles: ['ADMIN'] },
    
    { label: 'Địa chỉ', href: '/profile/addresses', icon: MapPin, roles: ['BUYER'] },
    
    { label: 'Đơn mua', href: '/profile/orders', icon: ShoppingBag, roles: ['BUYER'] },
    { label: 'Đơn bán', href: '/seller/orders', icon: ShoppingBag, roles: ['SELLER'] },

    { label: 'Đang theo dõi', href: '/profile/following', icon: UserPlus, roles: ['BUYER'] },
    
    { label: 'Thông báo', href: '/profile/notifications', icon: Bell, roles: ['BUYER', 'SELLER'] },
    { label: 'Bảo mật', href: '/profile/security', icon: Shield, roles: ['BUYER', 'SELLER', 'ADMIN'] },
];

export function ProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    
    if (!user) return null;

    const roleItems = sidebarItems.filter(item => item.roles.includes(user.role));

    // Determine the base path for breadcrumbs based on role
    const getBasePathInfo = () => {
        if (user.role === 'ADMIN') return { name: 'Admin', path: '/admin/dashboard' };
        if (user.role === 'SELLER') return { name: 'Kênh Người Bán', path: '/seller/dashboard' };
        return { name: 'Trang Chủ', path: '/' };
    };
    const baseInfo = getBasePathInfo();

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <Card className="border-0 shadow-sm sticky top-24">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {(user.username || 'U').substring(0, 1).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate cursor-pointer hover:underline" title="Chỉnh sửa hồ sơ">
                                        Sửa hồ sơ
                                    </p>
                                </div>
                            </div>

                            <Separator className="mb-4" />

                            <nav className="space-y-1 block">
                                {roleItems.map((item) => {
                                    const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/profile' && item.href !== '/seller/profile' && item.href !== '/admin/profile');
                                    
                                    // Exact match for base profile routes to avoid them being active when on sub-routes
                                    const isExactActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                                                ((item.href.endsWith('/profile') || item.href === '/profile') ? isExactActive : isActive)
                                                    ? 'bg-indigo-50 text-indigo-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <item.icon className={`h-5 w-5 ${((item.href.endsWith('/profile') || item.href === '/profile') ? isExactActive : isActive) ? 'text-indigo-700' : 'text-gray-400'}`} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                        <Link href={baseInfo.path} className="hover:text-indigo-600 transition-colors">
                            {baseInfo.name}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Tài Khoản Của Tôi</span>
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}
