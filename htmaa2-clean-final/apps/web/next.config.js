/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['rpc'],
  devIndicators: false,
  output: 'export',
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/htmaa2' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/htmaa2' : '',
  },
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
}

module.exports = nextConfig
