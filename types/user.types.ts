export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'BANNED' | 'DELETED';

export type SellerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type MembershipLevel = 'NORMAL' | 'SILVER' | 'GOLD' | 'VIP';

export type SellerType = 'STANDARD' | 'MALL' | 'PRO';

export interface BuyerProfile {
    membershipLevel: MembershipLevel;
    loyaltyPoints: number;
    totalSpent: number;
    createdAt: string;
    updatedAt: string;
}

export interface SellerProfile {
    shopName: string;
    sellerType: SellerType;
    verificationStatus: SellerVerificationStatus;
    taxCode?: string;
    shopRating: number;
    pickupAddress?: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: Role;
    status: UserStatus;
    phoneNumber?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    profile?: BuyerProfile | SellerProfile;
    buyerProfile?: BuyerProfile;
    sellerProfile?: SellerProfile;
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
    shopName?: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    role?: Role;
}

export interface SellerPublicProfile {
    id: string;
    username: string;
    shopName: string;
    sellerType: SellerType;
    shopRating: number;
    pickupAddress?: string;
    createdAt: string;
    stats: {
        totalProducts: number;
        totalReviews: number;
        rating: number;
        joinedAt: string;
    };
}
