import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite consumir os pacotes do monorepo como source TS (sem build)
  transpilePackages: ['@calculosonline/core', '@calculosonline/ui'],

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
