/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to enable API routes
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3001',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET
  }
  // Removed rewrites since API routes are now in the same app
};

module.exports = nextConfig;