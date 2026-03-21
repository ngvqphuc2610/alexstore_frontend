'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Store,
    Bell,
    LifeBuoy,
    Users,
    MessageSquare,
    Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
    { href: '/seller/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/seller/products', label: 'Sản phẩm của tôi', icon: Package },
    { href: '/seller/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { href: '/seller/promotions', label: 'Khuyến mãi', icon: Tag },
    { href: '/seller/followers', label: 'Người theo dõi', icon: Users },
    { href: '/seller/notifications', label: 'Thông báo', icon: Bell },
    { href: '/seller/chat', label: 'Tin nhắn', icon: MessageSquare },
    { href: '/seller/support', label: 'Hỗ trợ admin', icon: LifeBuoy },
];

const bottomItems = [
    { href: '/seller/settings', label: 'Cài đặt shop', icon: Settings },
];

export function SellerSidebar() {
    const pathname = usePathname();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const logout = useAuthStore((s) => s.logout);

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-emerald-800/20 bg-emerald-950 text-emerald-50 transition-all duration-300',
                sidebarOpen ? 'w-64' : 'w-[68px]'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 font-bold text-white shadow-lg shadow-emerald-500/25">
                    S
                </div>
                {sidebarOpen && (
                    <span className="text-lg font-bold tracking-tight">
                        Alex<span className="text-emerald-400">Seller</span>
                    </span>
                )}
            </div>

            <Separator className="bg-emerald-800/50" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {sidebarOpen && (
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-500/70">
                        Kênh người bán
                    </p>
                )}
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const linkContent = (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-emerald-600/20 text-emerald-400 shadow-sm'
                                    : 'text-emerald-400/60 hover:bg-emerald-800/60 hover:text-emerald-100'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-emerald-400')} />
                            {sidebarOpen && <span>{item.label}</span>}
                            {isActive && sidebarOpen && (
                                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
                            )}
                        </Link>
                    );

                    if (!sidebarOpen) {
                        return (
                            <Tooltip key={item.href} delayDuration={0}>
                                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                <TooltipContent side="right" className="bg-emerald-900 text-emerald-100 border-emerald-800">
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return linkContent;
                })}
            </nav>

            <Separator className="bg-emerald-800/50" />

            {/* Bottom section */}
            <div className="space-y-1 px-3 py-3">
                {bottomItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-emerald-800 text-white'
                                    : 'text-emerald-400/60 hover:bg-emerald-800/60 hover:text-emerald-100'
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                <button
                    onClick={async () => {
                        await logout();
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-400/60 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {sidebarOpen && <span>Đăng xuất</span>}
                </button>
            </div>

            {/* Toggle button */}
            <div className="border-t border-emerald-800/50 p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="w-full justify-center text-emerald-400/60 hover:bg-emerald-800 hover:text-emerald-100"
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </aside>
    );
}
