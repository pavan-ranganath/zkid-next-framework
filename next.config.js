/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: "raw-loader",
    });
    config.experiments = { topLevelAwait: true };
    return config;
  },
  experimental: {
    serverActions: true,
    esmExternals: "loose",
    serverComponentsExternalPackages: ["mongoose", "@typegoose/typegoose"],
  },
};

module.exports = nextConfig;
