import axios from "axios";
import { config as sharedConfig } from "@travelagency/config";

const apiClient = axios.create({
  baseURL: sharedConfig.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers.userId = userId;
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
