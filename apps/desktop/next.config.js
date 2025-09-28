/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/htmaa2/desktop",
  assetPrefix: "/htmaa2/desktop/",
  images: {
    unoptimized: true
  },
  devIndicators: false,
  webpack: (webpackConfig, { webpack }) => {
    webpackConfig.plugins.push(
      // Remove node: from import specifiers, because Next.js does not yet support node: scheme
      new webpack.NormalModuleReplacementPlugin(
        /^node:/,
        (resource) => {
          resource.request = resource.request.replace(/^node:/, '');
        },
      ),
    );

    return webpackConfig;
  },
  reactStrictMode: true,
  transpilePackages: ['rpc']
}

module.exports = nextConfig
