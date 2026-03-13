'use client';

import { Bell, Search, User as UserIcon, Store, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationDropdown } from './NotificationDropdown';

export function SellerTopbar() {
    const { user, logout } = useAuthStore();
    const profile = (user as any)?.profile;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-emerald-100 bg-white/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 border border-emerald-100">
                    <Store className="h-4 w-4" />
                    <span>{profile?.shopName || 'Gian hàng của tôi'}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <NotificationDropdown 
                    viewAllHref="/seller/notifications" 
                    className="text-emerald-600 hover:bg-emerald-50" 
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-emerald-100 p-0">
                            <Avatar className="h-9 w-9 border border-emerald-50">
                                <AvatarImage src="" alt={user?.username} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                    {user?.username?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 border-emerald-50">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-emerald-950">{user?.username}</p>
                                <p className="text-xs leading-none text-emerald-600/70">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-emerald-50" />
                        <DropdownMenuItem asChild className="focus:bg-emerald-50 focus:text-emerald-700">
                            <a href="/seller/profile" className="flex items-center cursor-pointer">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Hồ sơ cá nhân</span>
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-emerald-50 focus:text-emerald-700">
                            <a href="/" className="flex items-center cursor-pointer">
                                <Store className="mr-2 h-4 w-4" />
                                <span>Về trang mua sắm</span>
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-emerald-50" />
                        <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={async () => {
                                await logout();
                                window.location.href = '/login';
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
