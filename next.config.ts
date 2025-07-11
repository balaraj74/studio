
require('dotenv').config({ path: './.env.local' });
require('dotenv').config();

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: ['*.cloudworkstations.dev', '*.googleusercontent.com', '*.hosted.app', 'studio-agrisence.us-central1.hosted.app'],
  },
};

export default nextConfig;
