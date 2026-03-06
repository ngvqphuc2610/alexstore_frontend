import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, LogIn, Menu, LogOut, Heart, Headset, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';

export default function BuyerNavbar() {
    const { user, isAuthenticated, logout } = useAuthStore();

    // Fetch cart data to show item count
    const { data: cart } = useQuery({
        queryKey: ['cart'],
        queryFn: cartService.getCart,
        enabled: isAuthenticated, // Only fetch if logged in
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
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">

                {/* Mobile menu button */}
                <div className="flex md:hidden items-center">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <ShoppingBag className="h-7 w-7 text-primary" />
                    <span className="text-2xl font-black tracking-tighter text-gray-900">AlexStore<span className="text-primary">.</span></span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Trang chủ</Link>
                    <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">Sản phẩm</Link>
                    <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">Danh mục</Link>
                    <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Về chúng tôi</Link>
                </nav>

                {/* Search & Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden lg:flex relative mr-2">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 px-4 pl-10 text-sm outline-none focus:border-primary focus:bg-white"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    <Link href="/notifications" >
                        <Button variant="ghost" size="icon" className="relative group">
                            <Bell className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                        </Button>
                    </Link>

                    <Link href="/support" >
                        <Button variant="ghost" size="icon" className="relative group">
                            <Headset className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                        </Button>
                    </Link>

                    <Link href="/cart" >
                        <Button variant="ghost" size="icon" className="relative group">
                            <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                    


                    {/* User Auth */}
                    {isAuthenticated ? (
                        <div className="hidden sm:flex items-center gap-3 ml-2 border-l pl-4">
                            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                                    <User className="h-4 w-4 text-gray-600" />
                                </div>
                                <span className="text-sm font-medium hidden md:block">{user?.username || 'Tài khoản'}</span>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất" className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2 ml-2 border-l pl-4">
                            <Button variant="ghost" asChild className="text-sm font-medium">
                                <Link href="/login">Đăng nhập</Link>
                            </Button>
                            <Button asChild className="text-sm font-medium rounded-full px-6">
                                <Link href="/register">Đăng ký</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
