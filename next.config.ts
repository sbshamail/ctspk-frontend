import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate unique build ID to bust cache on each deployment
  generateBuildId: async () => {
    return Date.now().toString();
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow ALL hosts
      },
      {
        protocol: "http",
        hostname: "**", // allow ALL hosts
      },
    ],
  },
};

export default nextConfig;
