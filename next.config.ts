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
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'http://100.122.48.18:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
