import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Đặt lại mật khẩu | AlexStore',
    description: 'Thiết lập mật khẩu mới cho tài khoản của bạn',
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8">Đang tải...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
