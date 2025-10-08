/** @type {import('next').NextConfig} */
const repo = 'htmaa2';
const isGitHub = process.env.NODE_ENV === 'production' && process.env.BUILD_FOR_GITHUB === 'true';
const isProd = isGitHub;

const nextConfig = {
  output: 'export',
  // Only apply basePath/assetPrefix in production builds for GitHub Pages
  basePath: isProd ? `/${repo}/desktop` : '',
  assetPrefix: isProd ? `/${repo}/desktop/` : '',
  images: { unoptimized: true },
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
  transpilePackages: ['rpc'],

  // Provide dev-only rewrites so hardcoded /htmaa2/desktop/... paths work when running locally
  async rewrites() {
    if (isProd) { return [] }

    return [
      // Map requests like /htmaa2/desktop/icons/... -> /desktop/icons/...
      {
        source: `/${repo}/desktop/:path*`,
        destination: `/desktop/:path*`
      },
      // Also map /htmaa2/assets/... -> /assets/... if needed
      {
        source: `/${repo}/:path*`,
        destination: `/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
