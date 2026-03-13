'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User, LogOut, Settings } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function AdminTopbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const { sidebarOpen, toggleSidebar } = useUIStore();

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : 'AD';

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
            {/* Mobile menu toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={toggleSidebar}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Tìm kiếm..."
                    className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
                />
            </div>

            <div className="flex items-center gap-3 ml-auto">
                {/* Notifications */}
                <NotificationDropdown viewAllHref="/admin/notifications" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted/80">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium">{user?.username || 'Admin'}</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3 text-indigo-500" />
                                    Quản trị viên
                                </span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="font-medium">{user?.username || 'Admin'}</span>
                                <span className="text-xs text-muted-foreground">{user?.email || 'admin@alexstore.com'}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Hồ sơ
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Cài đặt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={async () => {
                                await logout();
                                window.location.href = '/login';
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
