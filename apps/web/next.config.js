const { config } = require('process')

/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['rpc'],
  devIndicators: false,
  // Static export for GitLab Pages
  output: 'export',
  // Ensure static hosting serves directory indexes correctly
  trailingSlash: true,
  // Support hosting under a subpath (e.g., /<project> on GitLab Pages)
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  // If next/image is used, disable optimization for static export
  images: { unoptimized: true },
  webpack: (config) => {
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
