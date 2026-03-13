'use client';

import React from 'react';
import { Bell, CheckCircle2, Inbox, Calendar, AlertCircle, ShoppingCart, Package, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService, NotificationItem } from '@/services/notifications.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/constants';
import { toast } from 'sonner';

export function NotificationsList() {
    const queryClient = useQueryClient();

    const { data: notificationsData, isLoading } = useQuery({
        queryKey: ['notifications-full'],
        queryFn: () => notificationsService.getNotifications(50),
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationsService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-full'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationsService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-full'] });
            toast.success('Đã đánh dấu tất cả là đã đọc');
        },
    });

    const handleMarkAsRead = (id: number) => {
        markAsReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER_CREATED':
                return <ShoppingCart className="h-5 w-5 text-blue-500" />;
            case 'ORDER_STATUS_UPDATED':
                return <Package className="h-5 w-5 text-indigo-500" />;
            case 'NEW_ORDER_FOR_SELLER':
                return <Inbox className="h-5 w-5 text-orange-500" />;
            case 'PRODUCT_APPROVED':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'PRODUCT_REJECTED':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'LOW_STOCK_ALERT':
                return <AlertCircle className="h-5 w-5 text-amber-500" />;
            default:
                return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const notifications = notificationsData?.data || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4 border-dashed animate-pulse bg-gray-50/50">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/4 bg-gray-200 rounded" />
                                <div className="h-3 w-3/4 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Thông báo của bạn</h2>
                        <p className="text-sm text-gray-500">
                            Bạn có <span className="font-semibold text-primary">{unreadCount}</span> thông báo chưa đọc
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending}
                        className="hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            <Card className="overflow-hidden border-none shadow-md">
                <div className="divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center bg-white">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Inbox className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Không có thông báo</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                                Khi có hoạt động mới, chúng tôi sẽ hiển thị thông báo ở đây.
                            </p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                className={`p-5 flex gap-4 hover:bg-gray-50/80 transition-all cursor-pointer group relative ${!notif.isRead ? 'bg-primary/5' : 'bg-white'}`}
                            >
                                {!notif.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${!notif.isRead ? 'bg-white' : 'bg-gray-50'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className={`text-base mb-1 ${!notif.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                {notif.title}
                                            </h4>
                                            <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                        {!notif.isRead && (
                                            <Badge variant="default" className="bg-primary hover:bg-primary shadow-sm shrink-0">
                                                Mới
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-medium tracking-wide">
                                        <div className="flex items-center gap-1.5 uppercase">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(notif.createdAt)}
                                        </div>
                                        <Separator orientation="vertical" className="h-3 h-gray-200" />
                                        <span className="uppercase">{notif.type.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
