const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    // Fixes warning from mongodb - https://github.com/Automattic/mongoose/issues/13212#issuecomment-1518012851
    Object.assign(config.resolve.alias, {
      "@mongodb-js/zstd": false,
      "@aws-sdk/credential-providers": false,
      snappy: false,
      aws4: false,
      "mongodb-client-encryption": false,
      kerberos: false,
      "supports-color": false,
    });
    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: [/the request of a dependency is an expression/],
      }),
    );
    return config;
  },

  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
};

module.exports = nextConfig;
