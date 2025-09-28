/** @type {import('next').NextConfig} */
const repo = "htmaa2";
const isProd = process.env.NODE_ENV === "production" && process.env.BUILD_FOR_GITHUB === "true";

const nextConfig = {
  output: "export",
  basePath: isProd ? "" : "",
  assetPrefix: isProd ? "" : "",
  images: { 
    unoptimized: true,
    qualities: [25, 50, 75, 100]
  },
  trailingSlash: true,
  reactStrictMode: true,
  transpilePackages: ["rpc"],
  devIndicators: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "" : ""
  },
  webpack: (config) => {
    config.module.rules.push({ test: /\.frag$/, type: "asset/source" });
    config.module.rules.push({ test: /\.vert$/, type: "asset/source" });
    return config;
  },
};

module.exports = nextConfig;
