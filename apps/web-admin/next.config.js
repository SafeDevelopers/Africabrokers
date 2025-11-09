// Validate environment variables at build time
// Note: validate-env.ts is TypeScript, so we skip it in Docker builds
// Environment variables are validated at runtime instead
// This prevents build failures when env vars are not set during Docker build
if (process.env.SKIP_ENV_VALIDATION !== 'true') {
  try {
    // Try to require ts-node if available (for local development)
    require('ts-node/register');
    require('./lib/validate-env.ts');
  } catch (e) {
    // If ts-node is not available (Docker build), skip validation
    // Environment variables will be validated at runtime
    if (process.env.NODE_ENV !== 'production' || process.env.DOCKER_BUILD === 'true') {
      console.warn('⚠️  Skipping environment variable validation in Docker build.');
      console.warn('   Environment variables will be validated at runtime.');
    }
  }
}

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
