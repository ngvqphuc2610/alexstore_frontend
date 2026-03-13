import api from './api';

export interface NotificationItem {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    data: NotificationItem[];
    unreadCount: number;
}

export const notificationsService = {
    getNotifications: async (limit: number = 20): Promise<NotificationsResponse> => {
        return api.get(`/notifications?limit=${limit}`) as any;
    },

    markAsRead: async (id: number) => {
        return api.patch(`/notifications/${id}/read`) as any;
    },

    markAllAsRead: async () => {
        return api.patch('/notifications/read-all') as any;
    }
};
