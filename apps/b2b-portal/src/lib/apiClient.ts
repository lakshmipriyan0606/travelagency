import apiClient from "@travelagency/api-client";
import { ROUTES } from "./routes";

// Add B2B portal-specific response interceptor for 401 redirection
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      const reqUrl = String(error.config?.url || '');
      if (reqUrl.includes('logout')) {
        return Promise.reject(error);
      }
      // Clear B2B authentication cookies to prevent middleware redirect loops
      document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      window.location.href = ROUTES.login;
    }
    if (error.response && error.response.status === 403 && typeof window !== 'undefined') {
      const message = error.response.data?.error?.message || error.response.data?.message || "";
      const match = /Forbidden: Agency account is (pending|rejected|suspended|needs_correction)/i.exec(message);
      if (match) {
        const newStatus = match[1].toLowerCase();
        document.cookie = `agency_status=${newStatus}; path=/; max-age=86400;`;
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
