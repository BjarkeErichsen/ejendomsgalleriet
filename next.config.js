/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pmfgjnkggklighnkgkwl.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Ensure high quality images with larger device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024],
  },
}

module.exports = nextConfig
