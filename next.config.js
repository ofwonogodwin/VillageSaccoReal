/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow production builds to complete with ESLint warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete with TypeScript warnings
    ignoreBuildErrors: true,
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
