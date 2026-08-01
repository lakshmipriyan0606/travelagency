export interface PageViewEvent {
  path?: string;
  title?: string;
  referrer?: string;
  timestamp?: string;
}

export interface VisitorDetail {
  visitorId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  referrer?: string;
  path?: string;
  time: string;
  firstVisit?: string;
  lastVisit?: string;
  visitCount?: number;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  devicePixelRatio?: number;
  language?: string;
  cookiesEnabled?: boolean;
  touchSupport?: boolean;
  onlineStatus?: boolean;
  landingPage?: string;
  currentPage?: string;
  pageViewCount?: number;
  pageViews?: PageViewEvent[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  pageLoad?: number;
  fcp?: number;
  lcp?: number;
  date?: string;
  daysSeen?: number;
}

export interface VisitorData {
  _id: string;
  count: number;
  pageViews?: number;
  details?: VisitorDetail[];
}

export interface VisitorOverview {
  today: number;
  yesterday: number;
  last7d: number;
  last30d: number;
  totalUnique: number;
  returning: number;
  pageViews: number;
  trends: {
    todayVsYesterday: number;
    last7d: number;
    last30d: number;
  };
}

export interface DistributionBucket {
  name: string;
  count: number;
}

export interface VisitorDistribution {
  days: number;
  deviceType: DistributionBucket[];
  browser: DistributionBucket[];
  os: DistributionBucket[];
  country: DistributionBucket[];
}

export interface RecentVisitorsResponse {
  items: VisitorDetail[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Unwrap sendSuccess payloads whether flattened or nested under `data`. */
export function unwrapAnalyticsPayload<T>(body: unknown): T | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if ("data" in record && record.data != null) {
    return record.data as T;
  }
  return body as T;
}
