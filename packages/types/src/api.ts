export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  nextCursor?: string;
  hasMore?: boolean;
}
