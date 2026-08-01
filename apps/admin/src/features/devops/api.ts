"use client";

import axiosClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";

const FP_KEY = "th_devops_fp";

export function getDevopsFingerprint(): string {
  if (typeof window === "undefined") return "server";
  let fp = localStorage.getItem(FP_KEY);
  if (!fp) {
    fp = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      Math.random().toString(36).slice(2),
    ].join("|");
    // Stable-ish id after first assign
    const stable = btoa(unescape(encodeURIComponent(fp))).slice(0, 64);
    localStorage.setItem(FP_KEY, stable);
    fp = stable;
  }
  return fp;
}

function csrfHeader() {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(/(?:^|; )devops_csrf=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : "";
  return token ? { "x-devops-csrf": token } : {};
}

export async function devopsPost<T = unknown>(url: string, body?: object) {
  const res = await axiosClient.post(url, body ?? {}, {
    headers: { ...csrfHeader() },
    withCredentials: true,
  });
  return res.data as T;
}

export async function devopsGet<T = unknown>(url: string) {
  const res = await axiosClient.get(url, { withCredentials: true });
  return res.data as T;
}

export async function devopsPatch<T = unknown>(url: string, body?: object) {
  const res = await axiosClient.patch(url, body ?? {}, {
    headers: { ...csrfHeader() },
    withCredentials: true,
  });
  return res.data as T;
}

export const devopsApi = {
  bootstrap: () => devopsPost(ENDPOINTS.client.devops.bootstrap),
  otpVerify: (code: string) =>
    devopsPost(ENDPOINTS.client.devops.otpVerify, { code }),
  totpSetup: () => devopsPost(ENDPOINTS.client.devops.totpSetup),
  totpVerify: (token: string) =>
    devopsPost(ENDPOINTS.client.devops.totpVerify, { token }),
  deviceRegister: (fingerprint: string, label?: string) =>
    devopsPost(ENDPOINTS.client.devops.deviceRegister, { fingerprint, label }),
  deviceVerify: (fingerprint: string) =>
    devopsPost(ENDPOINTS.client.devops.deviceVerify, { fingerprint }),
  sessionIssue: (fingerprint: string) =>
    devopsPost(ENDPOINTS.client.devops.sessionIssue, { fingerprint }),
  session: () => devopsGet(ENDPOINTS.client.devops.session),
  logout: () => devopsPost(ENDPOINTS.client.devops.logout),
  executive: () => devopsGet(ENDPOINTS.client.devops.executive),
  healthApps: () => devopsGet(ENDPOINTS.client.devops.healthApps),
  healthInfra: () => devopsGet(ENDPOINTS.client.devops.healthInfra),
  apiRequests: (params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params)}` : "";
    return devopsGet(`${ENDPOINTS.client.devops.apiRequests}${q}`);
  },
  apiPerformance: () => devopsGet(ENDPOINTS.client.devops.apiPerformance),
  errors: (status = "open") =>
    devopsGet(`${ENDPOINTS.client.devops.errors}?status=${status}`),
  patchError: (fp: string, status: string) =>
    devopsPatch(ENDPOINTS.client.devops.errorById(fp), { status }),
  logsSearch: (q = "") =>
    devopsGet(
      `${ENDPOINTS.client.devops.logsSearch}?q=${encodeURIComponent(q)}`
    ),
};
