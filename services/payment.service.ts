import api from './api';

export const paymentService = {
    createVNPayUrl: async (orderId: string): Promise<{ url: string }> => {
        return api.get(`/payment/vnpay/create-url/${orderId}`);
    },

    verifyVNPay: async (queryString: string): Promise<any> => {
        return api.get(`/payment/vnpay/verify${queryString}`);
    },

    createMoMoUrl: async (orderId: string): Promise<{ url: string }> => {
        return api.get(`/payment/momo/create-url/${orderId}`);
    },

    verifyMoMo: async (queryString: string): Promise<any> => {
        return api.get(`/payment/momo/verify${queryString}`);
    }
};
