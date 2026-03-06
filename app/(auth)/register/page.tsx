import { RegisterForm } from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Đăng ký | AlexStore',
    description: 'Tạo tài khoản AlexStore mới',
};

export default function RegisterPage() {
    return <RegisterForm />;
}
