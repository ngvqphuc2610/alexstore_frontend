import React from 'react';
import Link from 'next/link';
import {
    ShoppingBag,
    Search,
    User,
    LogIn,
    Menu,
    LogOut,
    Heart,
    Headset,
    Bell,
    Store,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';
import { notificationsService } from '@/services/notifications.service';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { formatDate } from '@/lib/constants';
import { NotificationDropdown } from './NotificationDropdown';

const NAV_CATEGORIES = [
    { label: 'Flash Deals', href: '/products?sort=discount' },
    { label: 'Electronics', href: '/products?category=electronics' },
    { label: 'Fashion', href: '/products?category=fashion' },
    { label: 'Home & Living', href: '/products?category=home' },
    { label: 'Beauty & Personal Care', href: '/products?category=beauty' },
    { label: 'Sports', href: '/products?category=sports' },
    { label: 'Toys & Kids', href: '/products?category=toys' },
    { label: 'Books', href: '/products?category=books' },
];

export default function BuyerNavbar() {
    const { user, isAuthenticated, logout } = useAuthStore();

    const { data: cart } = useQuery({
        queryKey: ['cart'],
        queryFn: cartService.getCart,
        enabled: isAuthenticated,
    });

    const cartItemsCount = cart?.items?.length || 0;

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Đã đăng xuất thành công');
        } catch {
            toast.error('Có lỗi xảy ra khi đăng xuất');
        }
    };

    return (
        <header suppressHydrationWarning className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            {/* ── Main row ── */}
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">

                {/* Mobile hamburger */}
                <div className="flex md:hidden items-center">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <ShoppingBag className="h-7 w-7 text-primary" />
                    <span className="text-2xl font-black tracking-tighter text-gray-900">
                        AlexStore<span className="text-primary">.</span>
                    </span>
                </Link>

                {/* Search bar — visible on desktop */}
                <div className="hidden lg:flex relative flex-1 max-w-lg mx-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products, brands and shops..."
                        className="w-full h-10 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                    />
                </div>

                {/* Right‑side actions */}
                <div className="flex items-center gap-1 md:gap-2">
                    {/* Become a Seller — desktop only */}
                    {(!isAuthenticated || user?.role === 'BUYER') && (
                        <Button asChild variant="outline" size="sm" className="hidden md:flex gap-1.5 mr-2 border-primary text-primary hover:bg-primary hover:text-white">
                            <Link href={isAuthenticated ? '/profile/become-seller' : '/register?role=seller'}>
                                <Store className="h-4 w-4" />
                                Bán hàng cùng AlexStore
                            </Link>
                        </Button>
                    )}

                    {/* Wishlist */}
                    <Link href="/wishlist">
                        <Button variant="ghost" size="icon" className="relative group">
                            <Heart className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                        </Button>
                    </Link>

                    {/* Notifications */}
                    <NotificationDropdown viewAllHref="/profile/notifications" />

                    {/* Support */}
                    <Link href="/support">
                        <Button variant="ghost" size="icon" className="relative group">
                            <Headset className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                        </Button>
                    </Link>

                    {/* Cart */}
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative group">
                            <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {/* User auth */}
                    {isAuthenticated ? (
                        <div className="hidden sm:flex items-center gap-2 ml-2 border-l pl-3">
                            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                                    <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium hidden md:block">{user?.username || 'My Account'}</span>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                title="Đăng xuất"
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2 ml-2 border-l pl-3">
                            <Button variant="ghost" asChild size="sm">
                                <Link href="/login" className="flex items-center gap-1">
                                    <LogIn className="h-4 w-4" />
                                    My Account
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Category nav row ── */}
            <div className="hidden md:block border-t bg-white">
                <nav className="container mx-auto px-4 lg:px-8 flex items-center gap-6 h-10 overflow-x-auto scrollbar-hide">
                    {NAV_CATEGORIES.map((cat) => (
                        <Link
                            key={cat.href}
                            href={cat.href}
                            className="flex-shrink-0 text-sm text-gray-600 hover:text-primary transition-colors whitespace-nowrap"
                        >
                            {cat.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
