import { config as sharedConfig } from "@travelagency/config";

export const config = {
  apiBaseUrl: sharedConfig.apiBaseUrl,
  appBaseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3001",
} as const;
