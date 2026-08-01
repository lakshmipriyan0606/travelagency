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

function withQuery(base: string, params?: Record<string, string | undefined>) {
  if (!params) return base;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") q.set(k, v);
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export const devopsApi = {
  bootstrap: () => devopsPost(ENDPOINTS.client.devops.bootstrap),
  otpVerify: (code: string) =>
    devopsPost(ENDPOINTS.client.devops.otpVerify, {
      code,
      fingerprint: getDevopsFingerprint(),
    }),
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
  apiRequests: (params?: Record<string, string>) =>
    devopsGet(withQuery(ENDPOINTS.client.devops.apiRequests, params)),
  apiPerformance: (params?: Record<string, string>) =>
    devopsGet(withQuery(ENDPOINTS.client.devops.apiPerformance, params)),
  apiObservability: (params?: Record<string, string>) =>
    devopsGet(withQuery(ENDPOINTS.client.devops.apiObservability, params)),
  apiRollup: (force = false) =>
    devopsPost(ENDPOINTS.client.devops.apiRollup, { force }),
  errors: (params?: Record<string, string>) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.errors, {
        status: "open",
        ...params,
      })
    ),
  errorDetail: (fp: string) =>
    devopsGet(ENDPOINTS.client.devops.errorById(fp)),
  patchError: (fp: string, status: string) =>
    devopsPatch(ENDPOINTS.client.devops.errorById(fp), { status }),
  logsSearch: (q = "") =>
    devopsGet(
      `${ENDPOINTS.client.devops.logsSearch}?q=${encodeURIComponent(q)}`
    ),
  capacityOverview: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityOverview, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityMongodb: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityMongodb, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityCollections: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityCollections, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityDisk: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityDisk, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityMemory: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityMemory, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityForecast: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityForecast, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityAlerts: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityAlerts, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityApps: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityApps, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  capacityCloud: (fresh = false) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.capacityCloud, {
        fresh: fresh ? "1" : undefined,
      })
    ),
  businessSummary: () => devopsGet(ENDPOINTS.client.devops.businessSummary),
  trafficSummary: (days?: string) =>
    devopsGet(
      withQuery(ENDPOINTS.client.devops.trafficSummary, {
        days,
      })
    ),
  securitySummary: (params?: Record<string, string>) =>
    devopsGet(withQuery(ENDPOINTS.client.devops.securitySummary, params)),
  queuesSummary: () => devopsGet(ENDPOINTS.client.devops.queuesSummary),
  deploySummary: () => devopsGet(ENDPOINTS.client.devops.deploySummary),
  auditLogs: (params?: Record<string, string>) =>
    devopsGet(withQuery(ENDPOINTS.client.devops.auditLogs, params)),
  alerts: (status = "open") =>
    devopsGet(withQuery(ENDPOINTS.client.devops.alerts, { status })),
  patchAlert: (fp: string, status: string) =>
    devopsPatch(ENDPOINTS.client.devops.alertById(fp), { status }),
};
