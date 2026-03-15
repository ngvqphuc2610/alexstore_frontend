'use client';

import React from 'react';
import { NotificationsList } from '@/components/layout/NotificationsList';
import { EmailLogsList } from '@/components/admin/EmailLogsList';
import { NotificationSettings } from '@/components/admin/NotificationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Mail, Settings } from 'lucide-react';

export default function AdminNotificationsPage() {
    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Trung tâm Thông báo</h1>
                <p className="text-muted-foreground">Quản lý và theo dõi tất cả thông tin liên lạc và cảnh báo hệ thống.</p>
            </div>

            <Tabs defaultValue="system" className="w-full">
                <TabsList className="grid w-full max-w-xl grid-cols-3 mb-8">
                    <TabsTrigger value="system" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Hệ thống
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Lịch sử Email
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Cài đặt
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="system" className="mt-0">
                    <NotificationsList />
                </TabsContent>
                
                <TabsContent value="email" className="mt-0">
                    <EmailLogsList />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                    <NotificationSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
