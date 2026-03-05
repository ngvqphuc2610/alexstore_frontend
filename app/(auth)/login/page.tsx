import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Đăng nhập | AlexStore',
    description: 'Đăng nhập vào tài khoản AlexStore của bạn',
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8">Đang tải...</div>}>
            <LoginForm />
        </Suspense>
    );
}
