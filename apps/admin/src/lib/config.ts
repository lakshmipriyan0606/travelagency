import { config as sharedConfig } from "@travelagency/config";

export const config = {
  apiBaseUrl: sharedConfig.apiBaseUrl,
  appBaseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3002",
} as const;

// Retain legacy export to prevent breakages in existing pages
export const API_BASE_URL = sharedConfig.apiBaseUrl;
