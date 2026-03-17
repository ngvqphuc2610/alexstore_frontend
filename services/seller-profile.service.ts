import api from './api';
import type { SellerPublicProfile } from '@/types';

export const sellerProfileService = {
    getPublicProfile: async (sellerId: string): Promise<SellerPublicProfile> => {
        return api.get(`/users/seller-profile/${sellerId}`);
    },
};
