const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl && process.env.NODE_ENV !== 'development') {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required in production/staging environments.");
}

export const config = {
  apiBaseUrl: apiBaseUrl || 'http://localhost:5000/api',
} as const;
