/** @type {import('next').NextConfig} */
const repo = "htmaa2";
// Support an explicit deploy base path for non-GitHub hosts (e.g. GitLab pages)
const deployBase = process.env.DEPLOY_BASE_PATH || '';
const isGitHub = process.env.NODE_ENV === "production" && process.env.BUILD_FOR_GITHUB === "true";
const isGitLab = process.env.NODE_ENV === "production" && process.env.BUILD_FOR_GITLAB === "true";
const isProd = isGitHub || isGitLab || !!deployBase;

const nextConfig = {
  output: "export",
  basePath: (function(){
    if (deployBase) return deployBase.startsWith('/') ? deployBase : '/' + deployBase;
    return isProd ? `/${repo}` : '';
  })(),
  assetPrefix: (function(){
    if (deployBase) return (deployBase.startsWith('/') ? deployBase : '/' + deployBase) + '/';
    return isProd ? `/${repo}/` : '';
  })(),
  images: { 
    unoptimized: true,
    qualities: [25, 50, 75, 100]
  },
  trailingSlash: true,
  reactStrictMode: true,
  transpilePackages: ["rpc"],
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: (function(){
      if (deployBase) return deployBase.startsWith('/') ? deployBase : '/' + deployBase;
      return isProd ? `/${repo}` : '';
    })()
  },
  webpack: (config) => {
    config.module.rules.push({ test: /\.frag$/, type: "asset/source" });
    config.module.rules.push({ test: /\.vert$/, type: "asset/source" });
    return config;
  },
  // Provide dev-only rewrites so hardcoded /htmaa2/... paths work when running locally
  async rewrites() {
    if (isProd) { return [] }

    return [
      // Map requests like /htmaa2/web/... -> /... first, then a generic /htmaa2/:path* -> /:path*
      // This mirrors the desktop app's dev rewrites and ensures the more specific
      // web subtree is handled before the generic fallback.
      {
        source: `/${repo}/web/:path*`,
        destination: `/:path*`
      },
      {
        source: `/${repo}/:path*`,
        destination: `/:path*`
      }
    ];
  },
};

module.exports = nextConfig;
