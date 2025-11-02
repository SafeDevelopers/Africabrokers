/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is stable in Next.js 13.4+
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

module.exports = nextConfig;
