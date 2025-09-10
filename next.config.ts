
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
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the preview iframe.
    // In newer Next.js versions, this might be handled automatically or via a different config.
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: 'QqXsqHjpCn-22R2id_sYpiW7fOemxFSZTw5fMlEh3Zs',
  },
};

export default nextConfig;
