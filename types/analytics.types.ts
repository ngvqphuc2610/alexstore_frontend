export interface PaginationMetadata {
    total: number
    pages: number
    currentPage: number
    limit: number
}

export interface OverviewData {
    totalUsers: number
    totalSellers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
}

export interface RevenueAnalyticsData {
    totalRevenue: number
    revenueByDate: {
        date: string
        revenue: number
    }[]
}

export interface OrdersAnalyticsData {
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    ordersByDate: {
        date: string
        orders: number
    }[]
}

export interface SellersAnalyticsData {
    totalSellers: number
    activeSellers: number
    newSellersThisMonth: number
    topSellers: {
        id: string
        username: string
        revenue: number
        totalOrders: number
        totalProducts: number
    }[]
    pagination?: PaginationMetadata
}

export interface ProductsAnalyticsData {
    totalProducts: number
    activeProducts: number
    outOfStockProducts: number
    topProducts: {
        id: string
        name: string
        sold: number
        revenue: number
    }[]
    pagination?: PaginationMetadata
}

export interface SellerListItem {
    id: string
    username: string
}
