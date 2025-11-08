// Validate environment variables at build time
require('./lib/validate-env');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is stable in Next.js 13.4+
  output: 'standalone',
  // Ensure standalone output is always generated
  experimental: {
    outputFileTracingIncludes: {
      '/': ['**/*'],
    },
  },
};

module.exports = nextConfig;
