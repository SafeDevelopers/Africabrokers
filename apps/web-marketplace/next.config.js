/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is stable in Next.js 13.4+
  // Always use standalone output for Docker builds
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  // Simplified webpack config - let Next.js handle chunking by default
  webpack: (config) => {
    return config;
  },
  // Enable SWC minification for better performance
  swcMinify: true,
};

module.exports = nextConfig;
