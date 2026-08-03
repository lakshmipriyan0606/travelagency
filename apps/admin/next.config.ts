import type { NextConfig } from "next";

/** Backend origin for same-origin browser proxy (avoids cross-port cookie drops). */
const BACKEND_ORIGIN =
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL)
    ?.replace(/\/api\/?$/, "")
    .replace(/\/$/, "") || "https://travelagency-api-staging.onrender.com";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
