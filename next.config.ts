import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper module resolution
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
