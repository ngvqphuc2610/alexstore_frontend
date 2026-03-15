import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quên mật khẩu | AlexStore',
    description: 'Yêu cầu mã OTP để khôi phục mật khẩu',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
