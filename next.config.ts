import type { NextConfig } from "next";
import path from "path";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

const WEBPILOT_URL = process.env.WEBPILOT_URL || "http://localhost:8001";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      // WebPilot: go directly to the Python microservice
      {
        source: "/api/webpilot/:path*",
        destination: `${WEBPILOT_URL}/api/webpilot/:path*`,
      },
      // Everything else: go to NestJS backend
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
