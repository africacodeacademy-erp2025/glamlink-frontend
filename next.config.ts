import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Docker production builds
  async rewrites() {
    // Only add rewrites if we need to proxy to a different backend
    // Since we're using NEXT_PUBLIC_BACKEND_URL directly in API calls, we can skip this
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    // If backend URL is external (https), no need for proxy
    if (backendUrl && backendUrl.startsWith("https://")) {
      return [];
    }

    // Only proxy if using local backend
    return [
      {
        source: "/api/backend/:path*",
        destination: backendUrl || "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
