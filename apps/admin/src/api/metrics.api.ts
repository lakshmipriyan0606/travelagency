import axios from "axios";
import axiosClient from '@travelagency/api-client';

function normalizeBase(url: string | undefined) {
  return (url || "").replace(/\/$/, "");
}

export const fetchMetrics = async () => {
  const remoteBase = normalizeBase(process.env.NEXT_PUBLIC_METRICS_API_BASE_URL);
  const token = process.env.NEXT_PUBLIC_METRICS_TOKEN;

  // Call a *different* metrics host only when you have a shared secret (session cookies will not exist there).
  // If VITE_METRICS_API_BASE_URL is set to the raw API host but VITE_API_BASE_URL is your site proxy
  // (e.g. sastikaatravel.com/api), cookies live on the site — calling Render directly would always 401.
  if (remoteBase && token) {
    const client = axios.create({
      baseURL: remoteBase,
      withCredentials: false,
    });
    const response = await client.get("admin/metrics", {
      headers: { "x-metrics-token": token },
    });
    return response.data;
  }

  // Same host as login/session (withCredentials) — fixes 401 when admin UI is proxied on the main domain.
  const response = await axiosClient.get("admin/metrics", {
    headers: token ? { "x-metrics-token": token } : undefined,
  });
  return response.data;
};

export const fetchQueueHealth = async () => {
  const remoteBase = normalizeBase(process.env.NEXT_PUBLIC_METRICS_API_BASE_URL);
  const token = process.env.NEXT_PUBLIC_METRICS_TOKEN;

  if (remoteBase && token) {
    const client = axios.create({
      baseURL: remoteBase,
      withCredentials: false,
    });
    const response = await client.get("admin/queue/health", {
      headers: { "x-metrics-token": token },
    });
    return response.data;
  }

  const response = await axiosClient.get("admin/queue/health", {
    headers: token ? { "x-metrics-token": token } : undefined,
  });
  return response.data;
};

