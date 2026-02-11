/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async rewrites() {
    const backend = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
    return [
      { source: '/login', destination: '/auth' },
      { source: '/admin-login', destination: '/auth' },
      { source: '/auth-api/:path*', destination: `${backend}/auth-api/:path*` },
    ];
  },
  images: {
    unoptimized: true
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://localhost:3001',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(self)'
          },
          {
            key: 'Content-Security-Policy',
            value: "connect-src 'self' http://localhost:3001 https://localhost:3001 ws://localhost:3001 wss://localhost:3001;"
          }
        ]
      }
    ];
  },
  experimental: {
    // Remove invalid https option - use npm run dev --experimental-https instead
  }
};

module.exports = nextConfig;