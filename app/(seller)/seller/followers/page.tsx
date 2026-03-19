'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { followsService } from '@/services/follows.service';
import { Users, Loader2, Calendar, Mail, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FollowersPage() {
    const { data: followersRaw, isLoading } = useQuery({
        queryKey: ['seller-followers'],
        queryFn: followsService.getFollowers,
    });
    const followers = (followersRaw as any);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Người theo dõi</h1>
                    <p className="text-gray-500">Quản lý danh sách khách hàng đang theo dõi gian hàng của bạn.</p>
                </div>
                {followers && Array.isArray(followers) && (
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none px-4 py-1.5 text-sm font-bold">
                        {followers.length} Người theo dõi
                    </Badge>
                )}
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="text-lg">Danh sách chi tiết</CardTitle>
                    <CardDescription>
                        Dưới đây là thông tin các khách hàng đã nhấn theo dõi shop.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 opacity-50" />
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : (followers && Array.isArray(followers) && followers.length === 0) || !followers ? (
                        <div className="py-24 text-center space-y-4">
                            <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <Users className="h-10 w-10 text-gray-300" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-gray-900">Chưa có người theo dõi</p>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                    Hãy tiếp tục cải thiện sản phẩm và dịch vụ để thu hút thêm nhiều người theo dõi nhé!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-y border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày theo dõi</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày gia nhập</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {followers && Array.isArray(followers) && followers.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                        {(item.buyer.username || 'U').substring(0, 1).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{item.buyer.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                    {item.buyer.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5 text-gray-400" />
                                                    {new Date(item.buyer.joinedAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
