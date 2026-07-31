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
    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
