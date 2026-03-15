import api from './api';

export interface CreateSupportRequestData {
    type: string;
    title: string;
    description: string;
}

export const supportService = {
    /** Submit a new support request */
    async createRequest(data: CreateSupportRequestData) {
        return api.post('/support', data);
    },

    /** Get current user's support requests */
    async getMyRequests(): Promise<any[]> {
        return api.get('/support/me');
    },

    /** Get all support requests (Admin only) */
    async getAllRequestsForAdmin(): Promise<any[]> {
        return api.get('/support/admin/all');
    },

    /** Reply to a support request (Admin only) */
    async replyToRequest(id: number, data: { adminReply: string; status: string }) {
        return api.patch(`/support/${id}/reply`, data);
    },

    /** Get specific request detail */
    async getRequestDetail(id: number) {
        return api.get(`/support/${id}`);
    }
};
