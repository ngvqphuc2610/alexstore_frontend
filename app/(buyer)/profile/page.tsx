'use client';

import React, { useState, useEffect } from 'react';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '@/services/users.service';
import { toast } from 'sonner';

export default function BuyerProfilePage() {
    const { user, setUser } = useAuthStore();
    const queryClient = useQueryClient();

    // Local state for the form
    const [phoneNumber, setPhoneNumber] = useState('');

    // Fetch full profile data
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: usersService.getProfile,
    });

    useEffect(() => {
        if (profile) {
            setPhoneNumber(profile.phoneNumber || '');
        }
    }, [profile]);

    // Mutation to update profile
    const updateMutation = useMutation({
        mutationFn: usersService.updateProfile,
        onSuccess: async (updatedUser) => {
            toast.success('Cập nhật hồ sơ thành công');
            // Refresh local auth state and cache
            if (setUser) setUser(updatedUser);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
        }
    });

    const handleSave = () => {
        updateMutation.mutate({ phoneNumber });
    };

    if (!user) return null;

    return (
        <ProfileLayout>
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Hồ sơ của tôi</CardTitle>
                    <CardDescription>
                        Quản lý thông tin hồ sơ để bảo mật tài khoản
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="py-10 text-center text-muted-foreground">Đang tải thông tin...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">Tên đăng nhập</Label>
                                <Input id="username" value={user.username} disabled className="bg-muted text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user.email} disabled className="bg-muted text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input 
                                    id="phone" 
                                    value={phoneNumber} 
                                    onChange={(e) => setPhoneNumber(e.target.value)} 
                                    placeholder="090 123 4567" 
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-4 flex justify-end">
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleSave}
                            disabled={updateMutation.isPending || isLoading}
                        >
                            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ProfileLayout>
    );
}
