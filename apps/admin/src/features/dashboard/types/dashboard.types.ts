export interface VisitorDetail {
    userAgent?: string;
    ip?: string;
    referrer?: string;
    path?: string;
    time: string;
}

export interface VisitorData {
    _id: string;
    count: number;
    details?: VisitorDetail[];
}

export interface ApiRouteStat {
    route: string;
    method?: string;
    path?: string;
    count: number;
}

export interface ApiRouteDetail {
    route: string;
    method?: string;
    path?: string;
    total: number;
    statuses: { status: number; count: number }[];
}

export interface ApiUsageData {
    todayTotal: number;
    dailyStats: { _id: string; count: number }[];
    topRoutes: ApiRouteStat[];
    routeDetails: ApiRouteDetail[];
}
