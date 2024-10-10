/** @type {import('next').NextConfig} */
import VeauryVuePlugin from "veaury/webpack/VeauryVuePlugin.mjs";

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["avatars.githubusercontent.com", "picsum.photos"],
  },
  webpack(config) {
    config.plugins.unshift(
      new VeauryVuePlugin({
        isNext: true,
      })
    );
    return config;
  },
};

export default nextConfig;
