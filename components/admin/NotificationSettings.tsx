'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BellRing, Shield, ShoppingBag, Megaphone, Loader2 } from 'lucide-react';
import { notificationsService } from '@/services/notifications.service';

export function NotificationSettings() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['notification-settings'],
        queryFn: () => notificationsService.getSettings()
    });

    const mutation = useMutation({
        mutationFn: (newData: any) => notificationsService.updateSettings(newData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
            toast.success('Đã cập nhật cấu hình thông báo');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Cập nhật thất bại');
        }
    });

    const handleToggle = (key: string, value: boolean) => {
        mutation.mutate({ [key]: value });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-indigo-500" />
                        Cấu hình Email
                    </CardTitle>
                    <CardDescription>
                        Quản lý các loại email bạn muốn nhận từ hệ thống.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex flex-col space-y-1">
                            <Label className="text-base flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Cập nhật Đơn hàng
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                Nhận email khi có đơn hàng mới hoặc thay đổi trạng thái.
                            </span>
                        </div>
                        <Switch 
                            checked={settings?.emailOrderUpdates} 
                            onCheckedChange={(val) => handleToggle('emailOrderUpdates', val)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex flex-col space-y-1">
                            <Label className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Thông báo Bảo mật & Hệ thống
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                Quan trọng: Các cảnh báo về tài khoản và yêu cầu từ Seller.
                            </span>
                        </div>
                        <Switch 
                            checked={settings?.emailSellerAlerts} 
                            onCheckedChange={(val) => handleToggle('emailSellerAlerts', val)}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex flex-col space-y-1">
                            <Label className="text-base flex items-center gap-2">
                                <Megaphone className="h-4 w-4" />
                                Tin tức & Marketing
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                Nhận thông tin về các chương trình khuyến mãi và tính năng mới.
                            </span>
                        </div>
                        <Switch 
                            checked={settings?.emailMarketing} 
                            onCheckedChange={(val) => handleToggle('emailMarketing', val)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Ghi chú cho Admin</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
                    <p>
                        Các thiết lập này là cá nhân cho tài khoản Admin của bạn. Việc tắt thông báo email không ảnh hưởng đến việc ghi nhận <strong>Email Logs</strong> trong hệ thống.
                    </p>
                    <p>
                        Email hệ thống sẽ luôn được gửi cho khách hàng và người bán dựa trên cấu hình riêng của họ để đảm bảo quy trình vận hành.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
