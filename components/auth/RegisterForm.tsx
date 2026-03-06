'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormValues } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export const RegisterForm = () => {
    const router = useRouter();
    const registerUser = useAuthStore((state) => state.register);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'BUYER',
        },
    });

    const role = watch('role');

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await registerUser(data);
            toast.success('Đăng ký thành công!');
            router.push('/');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Đăng ký thất bại');
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-primary/10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Tạo tài khoản</CardTitle>
                <CardDescription className="text-center">
                    Tham gia AlexStore ngay hôm nay
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Tên người dùng</Label>
                        <Input
                            id="username"
                            placeholder="johndoe"
                            {...register('username')}
                            className={errors.username ? 'border-destructive' : ''}
                        />
                        {errors.username && (
                            <p className="text-xs text-destructive">{errors.username.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            {...register('email')}
                            className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                            className={errors.password ? 'border-destructive' : ''}
                        />
                        {errors.password && (
                            <p className="text-xs text-destructive">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Tôi là</Label>
                        <Select
                            onValueChange={(value: any) => setValue('role', value)}
                            defaultValue="BUYER"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BUYER">Người mua (Buyer)</SelectItem>
                                <SelectItem value="SELLER">Người bán (Seller)</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-xs text-destructive">{errors.role.message}</p>
                        )}
                    </div>

                    {role === 'SELLER' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <Label htmlFor="shopName">Tên cửa hàng</Label>
                            <Input
                                id="shopName"
                                placeholder="My Awesome Store"
                                {...register('shopName')}
                                className={errors.shopName ? 'border-destructive' : ''}
                            />
                            {errors.shopName && (
                                <p className="text-xs text-destructive">{errors.shopName.message}</p>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
};
