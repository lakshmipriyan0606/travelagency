import apiClient from "@travelagency/api-client";
import { ROUTES } from "./routes";

// Add B2B portal-specific response interceptor for 401 redirection
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      window.location.href = ROUTES.login;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { apiClient };
