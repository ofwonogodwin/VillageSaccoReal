/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  experimental: {
    // Reduce TypeScript strictness during build
    typedRoutes: false,
  },
  webpack: (config, { isServer }) => {
    // Ignore certain warnings
    config.ignoreWarnings = [
      { module: /node_modules/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
