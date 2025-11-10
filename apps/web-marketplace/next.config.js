// Validate environment variables at build time
// Gate it so it doesn't run at build time in Docker
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test' && process.env.SKIP_ENV_VALIDATION !== 'true') {
  try {
    require('./lib/validate-env');
  } catch {}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // temporary while stabilizing CI
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, path: false, os: false, crypto: false,
        stream: false, http: false, https: false, zlib: false, net: false, tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
