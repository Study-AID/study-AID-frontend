import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  watchOptions: {
    pollIntervalMs: 1000,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  // Disable ISR status in development mode
  devIndicators: false,
};

export default nextConfig;
