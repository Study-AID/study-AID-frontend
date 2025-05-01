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
};

export default nextConfig;
