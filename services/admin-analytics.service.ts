import api from './api'
import type {
    OverviewData,
    RevenueAnalyticsData,
    OrdersAnalyticsData,
    SellersAnalyticsData,
    ProductsAnalyticsData
} from '@/types'

export const adminAnalyticsService = {
    getOverview: async (): Promise<OverviewData> => {
        return await api.get('/admin-analytics/overview')
    },

    getRevenueAnalytics: async (range: string = '30d', sellerId?: string, categoryId?: string, from?: string, to?: string): Promise<RevenueAnalyticsData> => {
        let query = `range=${range}`;
        if (sellerId) query += `&sellerId=${sellerId}`;
        if (categoryId) query += `&categoryId=${categoryId}`;
        if (from) query += `&from=${from}`;
        if (to) query += `&to=${to}`;
        return await api.get(`/admin-analytics/revenue?${query}`)
    },

    getOrdersAnalytics: async (range: string = '30d', sellerId?: string, categoryId?: string, from?: string, to?: string): Promise<OrdersAnalyticsData> => {
        let query = `range=${range}`;
        if (sellerId) query += `&sellerId=${sellerId}`;
        if (categoryId) query += `&categoryId=${categoryId}`;
        if (from) query += `&from=${from}`;
        if (to) query += `&to=${to}`;
        return await api.get(`/admin-analytics/orders?${query}`)
    },

    getSellersAnalytics: async (range: string = '30d', sellerId?: string, categoryId?: string, from?: string, to?: string, page: number = 1, limit: number = 10): Promise<SellersAnalyticsData> => {
        let query = `range=${range}&page=${page}&limit=${limit}`;
        if (sellerId) query += `&sellerId=${sellerId}`;
        if (categoryId) query += `&categoryId=${categoryId}`;
        if (from) query += `&from=${from}`;
        if (to) query += `&to=${to}`;
        return await api.get(`/admin-analytics/sellers?${query}`)
    },

    getProductsAnalytics: async (range: string = '30d', sellerId?: string, categoryId?: string, from?: string, to?: string, page: number = 1, limit: number = 10): Promise<ProductsAnalyticsData> => {
        let query = `range=${range}&page=${page}&limit=${limit}`;
        if (sellerId) query += `&sellerId=${sellerId}`;
        if (categoryId) query += `&categoryId=${categoryId}`;
        if (from) query += `&from=${from}`;
        if (to) query += `&to=${to}`;
        return await api.get(`/admin-analytics/products?${query}`)
    },

    getSellersList: async (): Promise<{ id: string, username: string }[]> => {
        return await api.get('/admin-analytics/sellers-list')
    }

}