import * as z from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

export const registerSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    otpCode: z.string().length(6, 'Mã OTP phải có đúng 6 chữ số'),
    newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
