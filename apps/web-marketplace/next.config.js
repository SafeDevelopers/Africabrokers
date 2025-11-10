/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // TEMP while stabilizing CI builds; remove when green
  // typescript: { ignoreBuildErrors: true },
  // eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
