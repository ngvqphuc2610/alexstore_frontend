'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export const ForgotPasswordForm = () => {
    const router = useRouter();
    const forgotPassword = useAuthStore((state) => state.forgotPassword);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        try {
            await forgotPassword(data.email);
            toast.success('Mã OTP đã được gửi đến email của bạn!');
            router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
        } catch (error: any) {
            toast.error(error.message || 'Yêu cầu OTP thất bại');
        }
    };

    return (
        <Card className="w-full max-w-md shadow-lg border-primary/10">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Quên mật khẩu</CardTitle>
                <CardDescription className="text-center">
                    Nhập email của bạn để nhận mã OTP khôi phục mật khẩu
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Quay lại{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
};
