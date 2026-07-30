import apiClient from "@travelagency/api-client";
import { ROUTES } from "./routes";
import { config as adminConfig } from "./config";

// Add admin-specific request interceptor for URL rewriting
apiClient.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith("v1/")) {
    let url = config.url;
    if (url.startsWith('/')) url = url.slice(1);

    const isAdminAuth = url.startsWith('admin/login') || url.startsWith('admin/register') || url.startsWith('admin/logout') || url.startsWith('admin/session');
    const isInfrastructure = url.startsWith('admin/metrics') || url.startsWith('admin/queue');
    const isAdminDirect = url.startsWith('admin/');
    const isUpload = url.startsWith('upload');
    const isAnalytics = url.startsWith('analytics/');

    if (isAdminAuth) {
      config.url = 'v1/b2c-admin/auth/' + url.replace('admin/', '');
    } else if (isInfrastructure) {
      config.baseURL = adminConfig.apiBaseUrl.replace('/api', '');
      config.url = url.replace('admin/', '');
    } else if (isAdminDirect) {
      config.url = 'v1/b2c-admin/' + url.replace('admin/', '');
    } else if (isUpload) {
      config.url = 'v1/b2c-admin/' + url;
    } else if (isAnalytics) {
      // Dashboard metrics live on the admin gateway, not public B2C
      config.url = 'v1/b2c-admin/' + url;
    } else if (url.startsWith('blogs/admin')) {
      config.url = 'v1/b2c-admin/blogs/' + url.replace('blogs/admin/', '');
    } else if (url.startsWith('b2b/')) {
      config.url = url; // Keep B2B routes as-is
    } else {
      config.url = 'v1/b2c/' + url;
    }
  }
  return config;
});

// Add admin-specific response interceptor for 401 redirection
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith(ROUTES.b2b.prefix)) {
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
