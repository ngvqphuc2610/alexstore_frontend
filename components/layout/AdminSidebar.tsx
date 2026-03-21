'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Package,
    FolderTree,
    ShoppingCart,
    Star,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    LifeBuoy,
    TrendingUp,
    BarChart3,
    BarChart,
    PieChart,
    LineChart,
    Box,
    Bell,
    Tag
} from 'lucide-react';

const analyticsItems = [
    { href: '/admin/analytics/revenue', label: 'Doanh thu', icon: TrendingUp },
    { href: '/admin/analytics/orders', label: 'Đơn hàng', icon: BarChart3 },
    { href: '/admin/analytics/sellers', label: 'Người bán', icon: Users },
    { href: '/admin/analytics/products', label: 'Sản phẩm', icon: Box },
];

const managementItems = [
    { href: '/admin/users', label: 'Người dùng', icon: Users },
    { href: '/admin/seller-requests', label: 'Duyệt Seller', icon: ShieldCheck },
    { href: '/admin/products', label: 'Sản phẩm', icon: Package },
    { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
    { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
    { href: '/admin/reviews', label: 'Đánh giá', icon: Star },
    { href: '/admin/discounts', label: 'Khuyến mãi', icon: Tag },
    { href: '/admin/support', label: 'Hỗ trợ & Khiếu nại', icon: LifeBuoy },
    { href: '/admin/notifications', label: 'Thông báo', icon: Bell },
];

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

const bottomItems = [
    { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const logout = useAuthStore((s) => s.logout);

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-slate-950 text-slate-100 transition-all duration-300',
                sidebarOpen ? 'w-64' : 'w-[68px]'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/25">
                    A
                </div>
                {sidebarOpen && (
                    <span className="text-lg font-bold tracking-tight">
                        Alex<span className="text-indigo-400">Store</span>
                    </span>
                )}
            </div>

            <Separator className="bg-slate-800" />

            {/* Dashboard Link */}
            <div className="px-3 py-4">
                <Link
                    href="/admin/dashboard"
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        pathname === '/admin/dashboard'
                            ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    )}
                >
                    <LayoutDashboard className={cn('h-5 w-5 shrink-0', pathname === '/admin/dashboard' && 'text-indigo-400')} />
                    {sidebarOpen && <span>Dashboard</span>}
                </Link>
            </div>

            {/* Analytics Section */}
            <nav className="space-y-1 px-3 py-2">
                {sidebarOpen && (
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Phân tích
                    </p>
                )}
                {analyticsItems.map((item) => {
                    const isActive = pathname === item.href;
                    const linkContent = (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-indigo-400')} />
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    );
                    return sidebarOpen ? linkContent : (
                        <Tooltip key={item.href} delayDuration={0}>
                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    );
                })}
            </nav>

            <Separator className="bg-slate-800 mx-3 my-2 w-auto" />

            {/* Management Section */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                {sidebarOpen && (
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Quản lý
                    </p>
                )}
                {managementItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const linkContent = (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-indigo-400')} />
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    );
                    return sidebarOpen ? linkContent : (
                        <Tooltip key={item.href} delayDuration={0}>
                            <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                    );
                })}
            </nav>

            <Separator className="bg-slate-800" />

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
                                    ? 'bg-slate-800 text-white'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {sidebarOpen && <span>Đăng xuất</span>}
                </button>
            </div>

            {/* Toggle button */}
            <div className="border-t border-slate-800 p-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    className="w-full justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
