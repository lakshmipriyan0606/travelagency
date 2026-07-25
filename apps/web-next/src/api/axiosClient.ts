import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  // Global API Routing: Map legacy frontend paths to modularized backend paths
  if (config.url && !config.url.startsWith("v1/")) {
    let url = config.url;
    // Clean leading slash for consistency
    if (url.startsWith('/')) url = url.slice(1);

    const isAdminAuth = url.startsWith('admin/login') || url.startsWith('admin/register') || url.startsWith('admin/logout') || url.startsWith('admin/session');
    const isInfrastructure = url.startsWith('admin/metrics') || url.startsWith('admin/queue');
    const isPackagesAdmin = url.startsWith('packages/create') || url.startsWith('packages/update') || url.startsWith('packages/delete') || url.startsWith('packages/toggle') || url.startsWith('packages/updateRank');
    const isUpload = url.startsWith('upload');
    const isAdminDirect = url.startsWith('admin/');

    if (isAdminAuth) {
      config.url = 'v1/b2c-admin/auth/' + url.replace('admin/', '');
    } else if (isInfrastructure) {
      config.url = url; // Keep infrastructure routes as-is
    } else if (isAdminDirect) {
      config.url = 'v1/b2c-admin/' + url.replace('admin/', '');
    } else if (isPackagesAdmin || isUpload) {
      config.url = 'v1/b2c-admin/' + url;
    } else if (url.startsWith('blogs/admin')) {
      config.url = 'v1/b2c-admin/blogs/' + url.replace('blogs/admin/', '');
    } else {
      // Default to public B2C gateway
      config.url = 'v1/b2c/' + url;
    }
  }

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

