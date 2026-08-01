import apiClient from "@travelagency/api-client";
import { ROUTES } from "./routes";
import { config as adminConfig } from "./config";

/**
 * Browser calls go through Next rewrite `/api-proxy/*` → backend so
 * `access_token` / `devops_*` cookies are same-origin on :3002.
 * Server-side fetch still uses absolute BACKEND URL via `config.apiBaseUrl`.
 */
const BROWSER_API_BASE = "/api-proxy/api";
const BROWSER_ORIGIN_BASE = "/api-proxy";

if (typeof window !== "undefined") {
  apiClient.defaults.baseURL = BROWSER_API_BASE;
  apiClient.defaults.withCredentials = true;
}

// Add admin-specific request interceptor for URL rewriting
apiClient.interceptors.request.use((config) => {
  // Always pin browser traffic to the same-origin proxy (overrides package default :5000).
  if (typeof window !== "undefined") {
    const raw = String(config.url || "");
    const isInfra =
      raw.includes("admin/metrics") ||
      raw.includes("admin/queue") ||
      /(^|\/)(metrics|queue)(\/|$)/.test(raw);
    config.baseURL = isInfra ? BROWSER_ORIGIN_BASE : BROWSER_API_BASE;
    config.withCredentials = true;
  }

  if (config.url && !config.url.startsWith("v1/")) {
    let url = config.url;
    if (url.startsWith("/")) url = url.slice(1);

    const isAdminAuth =
      url.startsWith("admin/login") ||
      url.startsWith("admin/register") ||
      url.startsWith("admin/logout") ||
      url.startsWith("admin/session") ||
      url.startsWith("admin/forgot-password") ||
      url.startsWith("admin/reset-password");
    const isInfrastructure =
      url.startsWith("admin/metrics") || url.startsWith("admin/queue");
    const isAdminDirect = url.startsWith("admin/");
    const isUpload = url.startsWith("upload");
    const isAnalytics = url.startsWith("analytics/");

    if (isAdminAuth) {
      config.url = "v1/b2c-admin/auth/" + url.replace("admin/", "");
    } else if (isInfrastructure) {
      config.baseURL =
        typeof window !== "undefined"
          ? BROWSER_ORIGIN_BASE
          : adminConfig.apiBaseUrl.replace("/api", "");
      config.url = url.replace("admin/", "");
    } else if (isAdminDirect) {
      config.url = "v1/b2c-admin/" + url.replace("admin/", "");
    } else if (isUpload) {
      config.url = "v1/b2c-admin/" + url;
    } else if (isAnalytics) {
      config.url = "v1/b2c-admin/" + url;
    } else if (url.startsWith("blogs/admin")) {
      config.url = "v1/b2c-admin/blogs/" + url.replace("blogs/admin/", "");
    } else if (url.startsWith("b2b/")) {
      config.url = url;
    } else {
      config.url = "v1/b2c/" + url;
    }
  }
  return config;
});

// Add admin-specific response interceptor for 401 redirection
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      typeof window !== "undefined"
    ) {
      const reqUrl = String(error.config?.url || "");
      // Logout / session probes must not hard-redirect mid soft-logout flow
      if (reqUrl.includes("logout") || reqUrl.includes("session")) {
        return Promise.reject(error);
      }
      // DevOps step-up challenge (invalid OTP, etc.) — leave page UI to handle
      const path = window.location.pathname;
      const isDevopsChallenge =
        path.startsWith("/devops/challenge") ||
        /\/devops\/[^/]+\/login/.test(path) ||
        path === "/devops/login" ||
        /devops\/auth\/(bootstrap|otp|totp|device)/.test(reqUrl);
      if (isDevopsChallenge) {
        return Promise.reject(error);
      }
      if (path.startsWith("/devops") || reqUrl.includes("devops")) {
        window.location.href = ROUTES.devops.login();
      } else if (path.startsWith(ROUTES.b2b.prefix)) {
        window.location.href = ROUTES.b2b.login;
      } else {
        window.location.href = ROUTES.login;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
