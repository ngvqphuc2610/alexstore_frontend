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

  getRevenueAnalytics: async (range: string = '30d'): Promise<RevenueAnalyticsData> => {
    return await api.get(`/admin-analytics/revenue?range=${range}`)
  },

  getOrdersAnalytics: async (range: string = '30d'): Promise<OrdersAnalyticsData> => {
    return await api.get(`/admin-analytics/orders?range=${range}`)
  },

  getSellersAnalytics: async (): Promise<SellersAnalyticsData> => {
    return await api.get('/admin-analytics/sellers')
  },

  getProductsAnalytics: async (): Promise<ProductsAnalyticsData> => {
    return await api.get('/admin-analytics/products')
  }
}