import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['ddragon.leagueoflegends.com', 'raw.communitydragon.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.communitydragon.org',
      },
    ],
  },
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
