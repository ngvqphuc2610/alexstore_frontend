import * as z from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

export const registerSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    role: z.enum(['BUYER', 'SELLER']),
    shopName: z.string().optional(),
}).refine((data) => {
    if (data.role === 'SELLER' && !data.shopName) {
        return false;
    }
    return true;
}, {
    message: 'Tên cửa hàng là bắt buộc đối với Người bán',
    path: ['shopName'],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
