'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const resetPassword = useAuthStore((state) => state.resetPassword);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: email,
        },
    });

    useEffect(() => {
        if (email) {
            setValue('email', email);
        }
    }, [email, setValue]);

    const onSubmit = async (data: ResetPasswordFormValues) => {
        try {
            await resetPassword({
                email: data.email,
                otpCode: data.otpCode,
                newPassword: data.newPassword,
            });
            toast.success('Mật khẩu đã được thay đổi thành công!');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message || 'Đặt lại mật khẩu thất bại');
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-primary/10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Đặt lại mật khẩu</CardTitle>
                <CardDescription className="text-center">
                    Nhập mã OTP và mật khẩu mới của bạn
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            readOnly
                            className="bg-muted cursor-not-allowed"
                        />
                        {errors.email && (
                            <p className="text-xs text-destructive">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="otpCode">Mã OTP (6 chữ số)</Label>
                        <Input
                            id="otpCode"
                            placeholder="123456"
                            {...register('otpCode')}
                            className={errors.otpCode ? 'border-destructive' : ''}
                        />
                        {errors.otpCode && (
                            <p className="text-xs text-destructive">{errors.otpCode.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            {...register('newPassword')}
                            className={errors.newPassword ? 'border-destructive' : ''}
                        />
                        {errors.newPassword && (
                            <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            {...register('confirmPassword')}
                            className={errors.confirmPassword ? 'border-destructive' : ''}
                        />
                        {errors.confirmPassword && (
                            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Nhớ lại mật khẩu?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
};
