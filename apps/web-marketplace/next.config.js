/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is stable in Next.js 13.4+
  // Only use standalone output in production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
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
