import type { NextConfig } from "next";

/** Backend origin for same-origin browser proxy (avoids cross-port cookie drops). */
const BACKEND_ORIGIN =
  process.env.BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000";

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
