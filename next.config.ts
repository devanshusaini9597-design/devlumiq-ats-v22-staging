import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**', pathname: '**' }, { protocol: 'http', hostname: '**', pathname: '**' }],
  },
  compress: true,
};

export default nextConfig;
