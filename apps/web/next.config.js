/** @type {import('next').NextConfig} */
const repo = "htmaa2";
const isGitHub = process.env.NODE_ENV === "production" && process.env.BUILD_FOR_GITHUB === "true";
const isGitLab = process.env.NODE_ENV === "production" && process.env.BUILD_FOR_GITLAB === "true";
const isProd = isGitHub || isGitLab;

const nextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { 
    unoptimized: true,
    qualities: [25, 50, 75, 100]
  },
  trailingSlash: true,
  reactStrictMode: true,
  transpilePackages: ["rpc"],
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repo}` : ""
  },
  webpack: (config) => {
    config.module.rules.push({ test: /\.frag$/, type: "asset/source" });
    config.module.rules.push({ test: /\.vert$/, type: "asset/source" });
    return config;
  },
};

module.exports = nextConfig;
