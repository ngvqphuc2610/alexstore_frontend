'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProfileLayout } from '@/components/shared/ProfileLayout';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Store, MapPin, Mail, Image as ImageIcon, Loader2, Save } from 'lucide-react';

const profileSchema = z.object({
    shopName: z.string().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự').max(100, 'Tên cửa hàng không được quá 100 ký tự'),
    description: z.string().max(500, 'Mô tả không được quá 500 ký tự').optional().or(z.literal('')),
    taxCode: z.string().max(50, 'Mã số thuế không được quá 50 ký tự').optional().or(z.literal('')),
    pickupAddress: z.string().min(5, 'Địa chỉ lấy hàng phải có ít nhất 5 ký tự').max(255, 'Địa chỉ quá dài').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SellerProfilePage() {
    const { user, setUser } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: profileData, isLoading } = useQuery({
        queryKey: ['seller-profile'],
        queryFn: () => usersService.getProfile(),
        enabled: !!user,
    });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            shopName: '',
            description: '',
            taxCode: '',
            pickupAddress: '',
        },
    });

    useEffect(() => {
        if (profileData?.profile) {
            const profile = profileData.profile;
            form.reset({
                shopName: profile.shopName || '',
                description: profile.description || '',
                taxCode: profile.taxCode || '',
                pickupAddress: profile.pickupAddress || '',
            });
        }
    }, [profileData, form]);

    const updateMutation = useMutation({
        mutationFn: (data: ProfileFormValues) => usersService.updateSellerProfile(data),
        onSuccess: (response) => {
            toast.success('Cập nhật hồ sơ thành công!');
            queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
            // Update local user state
            if (user) {
                const updatedUser = { ...user, profile: { ...user.profile, ...response.data } as any };
                setUser(updatedUser);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        updateMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <ProfileLayout>
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            </ProfileLayout>
        );
    }

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
                        <div className="mt-14 mb-4 flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold">{form.getValues('shopName') || user?.username}</h2>
                                <p className="text-gray-500 text-sm">
                                    Tham gia ngày: {profileData?.profile?.createdAt ? new Date(profileData.profile.createdAt).toLocaleDateString('vi-VN') : '...'}
                                </p>
                            </div>
                            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                {profileData?.profile?.sellerType || 'STANDARD'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shop Information Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin Cửa hàng</CardTitle>
                                <CardDescription>
                                    Quản lý thông tin công khai của cửa hàng trên sàn giao dịch.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="shopName"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Tên cửa hàng</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập tên shop của bạn" {...field} />
                                                </FormControl>
                                                <FormDescription>Tên cửa hàng sẽ hiển thị trên tất cả sản phẩm của bạn.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Mô tả cửa hàng</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Viết vài dòng giới thiệu về cửa hàng của bạn..." 
                                                        rows={4} 
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="md:col-span-2 pt-4 border-t">
                                        <h3 className="text-md font-medium text-gray-900 mb-4">Thông tin Quản lý & Lấy hàng</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-gray-700 opacity-70">
                                            <Mail className="h-4 w-4" /> Email liên hệ (Cố định)
                                        </Label>
                                        <Input value={user?.email || ''} disabled className="bg-gray-50" />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="taxCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mã số thuế</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập mã số thuế (nếu có)" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="pickupAddress"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-400" /> Địa chỉ kho hàng (Lấy hàng)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập địa chỉ chi tiết nơi bưu tá sẽ đến lấy hàng..." {...field} />
                                                </FormControl>
                                                <FormDescription>Địa chỉ này rất quan trọng để đơn vị vận chuyển có thể đến lấy hàng.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-6 flex justify-end gap-3">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => form.reset()}
                                        disabled={updateMutation.isPending}
                                    >
                                        Hủy thay đổi
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        disabled={updateMutation.isPending}
                                    >
                                        {updateMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </ProfileLayout>
    );
}
