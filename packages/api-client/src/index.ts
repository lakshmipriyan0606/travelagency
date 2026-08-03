import axios from "axios";
import { config as sharedConfig } from "@travelagency/config";

const apiClient = axios.create({
  baseURL: sharedConfig.apiBaseUrl,
  withCredentials: true,
});

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers.userId = userId;
    }

    const token =
      getCookie("b2b_portal_access_token") ||
      getCookie("access_token") ||
      getCookie("admin_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (token && !config.headers.Authorization && !config.headers.authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      error.message = error.response.data.message || error.response.data.error || error.message;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
