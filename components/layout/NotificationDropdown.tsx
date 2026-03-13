'use client';

import React from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notifications.service';
import { useAuthStore } from '@/stores/authStore';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/constants';

interface NotificationDropdownProps {
    viewAllHref: string;
    className?: string;
}

export function NotificationDropdown({ viewAllHref, className }: NotificationDropdownProps) {
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationsService.getNotifications(5),
        enabled: isAuthenticated,
    });

    const unreadCount = notificationsData?.unreadCount || 0;
    const notifications = notificationsData?.data || [];

    const markAsReadMutation = useMutation({
        mutationFn: notificationsService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const handleNotificationClick = (id: number) => {
        markAsReadMutation.mutate(id);
    };

    return (
        <HoverCard openDelay={200} closeDelay={200}>
            <HoverCardTrigger asChild>
                <Link href={viewAllHref}>
                    <Button variant="ghost" size="icon" className={`relative group ${className}`}>
                        <Bell className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 shadow-lg border-gray-100" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <h4 className="font-semibold text-sm text-gray-900">Thông báo mới</h4>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                    {!isAuthenticated ? (
                        <div className="p-8 text-center text-sm text-gray-500 italic">
                            Vui lòng đăng nhập để xem thông báo.
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500 italic">
                            Bạn chưa có thông báo nào.
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={viewAllHref}
                                    onClick={() => !notif.isRead && handleNotificationClick(notif.id)}
                                    className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <div className={`w-2 h-2 rounded-full ${!notif.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm leading-tight ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
                                                {formatDate(notif.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-2 border-t border-gray-50 text-center bg-gray-50/30">
                    <Link href={viewAllHref} className="text-xs font-semibold text-primary hover:underline py-1 block">
                        Xem tất cả thông báo
                    </Link>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
