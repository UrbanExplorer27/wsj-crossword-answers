/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/screenshots/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/scrape',
        destination: '/api/scrape',
      },
    ]
  },
}

module.exports = nextConfig
