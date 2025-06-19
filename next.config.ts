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
  redirects: async () => {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: `https:///${process.env.NEXT_PUBLIC_API_URL?.replace('api', '')}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
