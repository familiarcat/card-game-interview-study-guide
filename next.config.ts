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
  
  // Static export configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // Base path for subdomain deployment
  basePath: '',
  
  // Asset prefix for static files
  assetPrefix: '',
};

export default nextConfig;
