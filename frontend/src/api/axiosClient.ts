import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    config.headers.userId = userId;
  }
  return config;
});

export default axiosClient;
