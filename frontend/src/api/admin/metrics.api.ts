import axios from "axios";

export const fetchMetrics = async () => {
  // Production metrics should come from the production backend, even when the admin panel runs locally.
  // Configure with:
  // - VITE_METRICS_API_BASE_URL=https://<your-prod-backend>/api
  // Fallback order:
  // - VITE_METRICS_API_BASE_URL
  // - VITE_API_BASE_URL
  // - Render default (this repo already references it in backend CORS allowlist)
  const baseURL =
    import.meta.env.VITE_METRICS_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://travelagency-1-odma.onrender.com/api";

  const metricsClient = axios.create({
    baseURL,
    // Avoid cross-origin cookie/CORS headaches; metrics endpoint is not user-session scoped.
    withCredentials: false,
  });

  const token = import.meta.env.VITE_METRICS_TOKEN;
  const response = await metricsClient.get("admin/metrics", {
    headers: token ? { "x-metrics-token": token } : undefined,
  });
  return response.data;
};
