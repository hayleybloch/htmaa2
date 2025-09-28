/** @type {import('next').NextConfig} */
const repo = "htmaa2";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
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
