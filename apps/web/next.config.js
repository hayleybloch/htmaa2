/** @type {import('next').NextConfig} */
const repo = "htmaa2";

const nextConfig = {
  output: "export",                 // enables static export
  basePath: `/${repo}`,             // prefix routes
  assetPrefix: `/${repo}/`,         // prefix static assets
  images: { unoptimized: true },    // needed when exporting if using next/image
  trailingSlash: true,               // safer for GitHub Pages
  reactStrictMode: true,
  transpilePackages: ['rpc'],
  devIndicators: false,
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
