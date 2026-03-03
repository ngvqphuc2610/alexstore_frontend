export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
    id: string;
    username: string;
    email: string;
    role: Role;
    isSellerVerified: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role?: Role;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface UpdateUserRequest {
    role?: Role;
    isSellerVerified?: boolean;
    isDeleted?: boolean;
}
