import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'cf',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'bing.com' },
      { protocol: 'https', hostname: 'cn.bing.com' },
      { protocol: 'https', hostname: 'images.weserv.nl' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
    dangerouslyAllowSVG: true,
  },
  env: {
    NEXT_PUBLIC_STATIC_PASSWORD: process.env.STATIC_PASSWORD || '123456',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  generateEtags: false,
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/public/uploads/**'
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
