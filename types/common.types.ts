export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    lastPage: number;
    limit: number;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}
