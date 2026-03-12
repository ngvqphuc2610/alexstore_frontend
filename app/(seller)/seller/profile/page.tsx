'use client';

import React from 'react';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Store, MapPin, Mail, Phone, Image as ImageIcon } from 'lucide-react';

export default function SellerProfilePage() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <ProfileLayout>
            <div className="space-y-6">
                {/* Shop Banner & Logo Settings */}
                <Card className="border-0 shadow-sm overflow-hidden">
                    <div className="h-32 bg-indigo-100 flex flex-col items-center justify-center text-indigo-800 relative group cursor-pointer">
                        <span className="text-sm font-medium z-10 flex items-center gap-2 group-hover:scale-110 transition-transform">
                            <ImageIcon className="h-4 w-4" /> Thay đổi ảnh bìa
                        </span>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <CardContent className="pt-0 relative px-6 pb-6">
                        <div className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden group cursor-pointer">
                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                                <Store className="h-10 w-10" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-medium">Đổi Logo</span>
                            </div>
                        </div>
                        <div className="mt-14 mb-4">
                            <h2 className="text-xl font-bold">{user.username} Shop</h2>
                            <p className="text-gray-500 text-sm">Tham gia ngày: 12/03/2026</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Shop Information */}
                <Card className="border-0 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Thông tin Cửa hàng</CardTitle>
                        <CardDescription>
                            Quản lý thông tin công khai của cửa hàng trên sàn giao dịch.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="shop-name">Tên cửa hàng</Label>
                                <Input id="shop-name" defaultValue={user.username + " Shop"} />
                                <p className="text-xs text-gray-400">Tên cửa hàng sẽ hiển thị trên tất cả sản phẩm của bạn.</p>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả cửa hàng</Label>
                                <Textarea id="description" placeholder="Viết vài dòng giới thiệu về cửa hàng của bạn..." rows={4} />
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t space-y-4">
                            <h3 className="text-md font-medium text-gray-900">Thông tin Liên hệ</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="contact-email" className="flex items-center gap-2 text-gray-700">
                                        <Mail className="h-4 w-4 text-gray-400" /> Email liên hệ
                                    </Label>
                                    <Input id="contact-email" defaultValue={user.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-phone" className="flex items-center gap-2 text-gray-700">
                                        <Phone className="h-4 w-4 text-gray-400" /> Số điện thoại
                                    </Label>
                                    <Input id="contact-phone" placeholder="0901234567" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shop-address" className="flex items-center gap-2 text-gray-700">
                                    <MapPin className="h-4 w-4 text-gray-400" /> Địa chỉ kho hàng
                                </Label>
                                <Input id="shop-address" placeholder="Nhập địa chỉ chi tiết hoặc địa chỉ kho hàng..." />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <Button variant="outline">Hủy in</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu thay đổi</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProfileLayout>
    );
}
