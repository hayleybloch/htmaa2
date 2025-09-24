const { config } = require('process')
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['rpc'],
  devIndicators: false,
  experimental: { externalDir: true },
  // If next/image is used and you prefer no optimization, keep unoptimized; otherwise you can remove
  images: { unoptimized: true },
  webpack: (config) => {
    // Resolve the internal workspace package "rpc" when building in isolation (e.g., Vercel rootDir apps/web)
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['rpc'] = path.resolve(__dirname, '../../packages/rpc')

    config.module.rules.push({
      test: /\.frag$/,
      // This is the asset module.
      type: 'asset/source',
    });

    config.module.rules.push({
      test: /\.vert$/,
      // This is the asset module.
      type: 'asset/source',
    });

    return config;
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
}

module.exports = nextConfig
