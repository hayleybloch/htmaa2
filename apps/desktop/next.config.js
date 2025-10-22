/** @type {import('next').NextConfig} */
const repo = 'htmaa2';
// Allow an explicit deployment base path for non-GitHub hosts (e.g. GitLab pages)
// Example: DEPLOY_BASE_PATH='/classes/863.25/people/HayleyBloch'
// DEPLOY_BASE_PATH should only affect production/static exports. In local
// development we must not pick up a deploy base (this causes assets to be
// requested from the exported `out/` tree or unexpected absolute paths).
const deployBase = process.env.DEPLOY_BASE_PATH || '';
const isGitHub = process.env.NODE_ENV === 'production' && process.env.BUILD_FOR_GITHUB === 'true';
// Treat as production only when explicitly building for GitHub Pages or when
// NODE_ENV=production and a deploy base is intentionally provided. This
// prevents local `next dev` from inheriting asset prefixes.
const isProd = isGitHub || (process.env.NODE_ENV === 'production' && !!deployBase);

const nextConfig = {
  // Only use static export output for production GitHub Pages builds.
  output: isProd ? 'export' : undefined,
  // Apply basePath/assetPrefix in production builds. If DEPLOY_BASE_PATH is
  // provided we use that value (it should be a leading-slash path without
  // trailing slash, e.g. '/classes/863.25/people/HayleyBloch'). Otherwise
  // fall back to the repo-based GitHub Pages path used previously.
  basePath: (function(){
    if (deployBase) {
      const p = deployBase.startsWith('/') ? deployBase : '/' + deployBase;
      return `${p}/desktop`;
    }
    return isProd ? `/${repo}/desktop` : '';
  })(),
  assetPrefix: (function(){
    if (deployBase) {
      const p = deployBase.startsWith('/') ? deployBase : '/' + deployBase;
      return `${p}/desktop/`;
    }
    return isProd ? `/${repo}/desktop/` : '';
  })(),
  // Expose the repository base (without the /desktop suffix) to runtime code
  // so code that uses NEXT_PUBLIC_BASE_PATH (and _document.tsx) can build correct URLs.
  env: {
    // Generic repo base (used by some runtime code)
    NEXT_PUBLIC_BASE_PATH: (function(){
      if (deployBase) return deployBase.startsWith('/') ? deployBase : '/' + deployBase;
      return isProd ? `/${repo}` : '';
    })(),
    // Desktop-specific published base so build-time code can emit
    // '/htmaa2/desktop/...' directly when building the desktop app for
    // GitHub Pages. This is picked up by `getPublicPath()`.
    NEXT_PUBLIC_DESKTOP_BASE: (function(){
      if (deployBase) return (deployBase.startsWith('/') ? deployBase : '/' + deployBase) + '/desktop';
      return isProd ? `/${repo}/desktop` : '';
    })()
  },
  images: { 
    unoptimized: true,
    qualities: [25, 50, 75, 100]
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
  transpilePackages: ['rpc'],

  // Provide dev-only rewrites so hardcoded /htmaa2/desktop/... paths work when running locally
  async rewrites() {
    if (isProd) { return [] }

    return [
      // Map requests like /htmaa2/desktop/icons/... -> /desktop/icons/...
      {
        // When running in dev, requests that include the GitHub Pages base path
        // (e.g. /htmaa2/desktop/icons/...) should be rewritten to the real
        // asset locations (e.g. /icons/...). Previously this rewrote to
        // /desktop/:path* which doesn't match files in `public/`.
        source: `/${repo}/desktop/:path*`,
        destination: `/:path*`
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
