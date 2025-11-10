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
  output: 'standalone',
  transpilePackages: ['@afribrok/lib', '@afribrok/env', '@afribrok/design-tokens', '@afribrok/ui'],
  webpack: (config, { isServer, webpack }) => {
    // Exclude server-only code from client bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        util: false,
      };
      // Ignore server-only files in client bundles
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/validate-env$/,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
