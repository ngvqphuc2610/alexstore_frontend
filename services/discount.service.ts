import api from './api';

export const discountService = {
  createSystemVoucher: async (data: any): Promise<any> => {
    return api.post('/discounts/admin', data);
  },
  createShopVoucher: async (data: any): Promise<any> => {
    return api.post('/discounts/seller', data);
  },
  saveVoucher: async (id: string): Promise<any> => {
    return api.post(`/discounts/wallet/${id}`);
  },
  getWallet: async (): Promise<any[]> => {
    return api.get('/discounts/wallet') as Promise<any>;
  },
  getSystemVouchers: async (): Promise<any[]> => {
    return api.get('/discounts/admin') as Promise<any>;
  },
  getShopVouchers: async (): Promise<any[]> => {
    return api.get('/discounts/seller') as Promise<any>;
  },
  getPublicSystemVouchers: async (): Promise<any[]> => {
    return api.get('/discounts/public/system') as Promise<any>;
  },
  getAllPublicShopVouchers: async (): Promise<any[]> => {
    return api.get('/discounts/public/shops/all') as Promise<any>;
  },
  getPublicShopVouchers: async (shopId: string): Promise<any[]> => {
    return api.get(`/discounts/public/shop/${shopId}`) as Promise<any>;
  }
};
