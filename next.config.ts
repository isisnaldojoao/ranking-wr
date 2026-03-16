import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Re-enable project isolation to prevent Next.js from looking at C:\Users\isisn\
  outputFileTracingRoot: __dirname,
  
  // Experimental: ensure we only look at local node_modules
  experimental: {
    externalDir: false,
  },
};

export default nextConfig;
