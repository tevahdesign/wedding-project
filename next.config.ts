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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' ,
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Allow cross-origin requests in development from the cloud workstation
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
  ...(process.env.NODE_ENV === 'development'
    ? {
        experimental: {
          allowedDevOrigins: [
            'https://*.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev',
          ],
        },
      }
    : {}),
};

export default nextConfig;
