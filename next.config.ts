
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
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the preview iframe.
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
   watchOptions: {
    // Exclude the genkit directory from Next.js's file watcher to prevent restart loops
    ignored: ['**/src/ai/.genkit/**'],
  },
};

export default nextConfig;
