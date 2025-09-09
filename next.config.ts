
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
  watchOptions: {
    ignored: ['**/src/ai/.genkit/**'],
  },
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: 'BKy-UaL9-3-sW_Gz5G_wDso9-y_SbYxAqncf27lJ3D-u-Y9j-tA6-i_lR-oGzM-pX_r-A6sB8cZ_eL-4KjY-jJk',
  },
};

export default nextConfig;
