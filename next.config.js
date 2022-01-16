const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");

const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["artisancoin.io"],
  },
};

module.exports = withPlugins([[withImages]], nextConfig);
