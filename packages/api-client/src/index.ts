import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers.userId = userId;
    }
  }
  return config;
});

// Intercept all API responses globally
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Determine the exact server error message if it exists
    if (error.response && error.response.data) {
      error.message = error.response.data.message || error.response.data.error || error.message;
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
