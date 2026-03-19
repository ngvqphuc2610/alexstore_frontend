import api from './api';

export const followsService = {
    follow: async (sellerId: string) => {
        return api.post(`/follows/${sellerId}`);
    },
    unfollow: async (sellerId: string) => {
        return api.delete(`/follows/${sellerId}`);
    },
    getFollowing: async () => {
        return api.get('/follows/me/following');
    },
    getFollowers: async () => {
        return api.get('/follows/me/followers');
    },
    getStatus: async (sellerId: string): Promise<{ isFollowing: boolean }> => {
        return api.get(`/follows/status/${sellerId}`);
    },
    getFollowingCount: async () => {
        return api.get('/follows/me/following-count');
    },
    getFollowerCount: async () => {
        return api.get('/follows/me/follower-count');
    },
};
