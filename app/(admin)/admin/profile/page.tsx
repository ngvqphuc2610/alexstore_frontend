'use client';

import React from 'react';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, KeyRound } from 'lucide-react';

export default function AdminProfilePage() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <ProfileLayout>
            <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="border-b bg-gray-50/50 pb-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <ShieldCheck className="h-6 w-6 text-indigo-700" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Hồ sơ Quản trị viên</CardTitle>
                                <CardDescription>Quản lý tài khoản và bảo mật hệ thống</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Basic Info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-name">Họ và tên</Label>
                                    <Input id="admin-name" defaultValue={user.username} className="bg-muted text-muted-foreground" disabled />
                                    <p className="text-xs text-gray-500">Tên quản trị viên không thể tự thay đổi. Liên hệ Super Admin để đổi.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email">Email hệ thống</Label>
                                    <Input id="admin-email" defaultValue={user.email} className="bg-muted text-muted-foreground" disabled />
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="pt-6 border-t">
                            <div className="flex items-center gap-2 mb-4">
                                <KeyRound className="h-5 w-5 text-gray-500" />
                                <h3 className="text-lg font-medium text-gray-900">Bảo mật</h3>
                            </div>
                            <div className="max-w-md space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                                <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                                    Cập nhật mật khẩu
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProfileLayout>
    );
}
