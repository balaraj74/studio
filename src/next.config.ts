
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
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: 'BJVgljqAk8GF4DKhhyjjNfAUrWVZgNUsJOdezVGs4jxmp3_7E_e2ZQzgHF0E-ACow9UI4XLaHO_mWtfe-zZQJg0',
  },
};

export default nextConfig;
