export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface ApiErrorResponse {
    statusCode: number;
    timestamp?: string;
    path?: string;
    method?: string;
    message: string | string[];
    error?: string;
}
