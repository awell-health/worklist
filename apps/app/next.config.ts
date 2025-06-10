import { createJiti } from 'jiti'
import type { NextConfig } from 'next'

const jiti = createJiti(new URL(import.meta.url).pathname)
await jiti.import('./app/env.ts', { default: true })

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        search: '',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        search: '',
      },
    ],
  },
}

export default nextConfig
