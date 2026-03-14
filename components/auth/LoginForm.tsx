'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const login = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const redirectUrl = await login(data.email, data.password);
            toast.success('Đăng nhập thành công!');
            router.push(callbackUrl !== '/' ? callbackUrl : redirectUrl);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Đăng nhập thất bại');
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-primary/10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
                <CardDescription className="text-center">
                    Nhập email và mật khẩu của bạn để truy cập AlexStore
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-primary hover:underline"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Đăng ký ngay
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
};
