const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");
const withPWA = require("next-pwa")({
  dest: "public",
});
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // // Fixes warning from mongodb - https://github.com/Automattic/mongoose/issues/13212#issuecomment-1518012851
    Object.assign(config.resolve.alias, {
      "@mongodb-js/zstd": false,
      "@aws-sdk/credential-providers": false,
      snappy: false,
      aws4: false,
      "mongodb-client-encryption": false,
      kerberos: false,
      "supports-color": false,
    });
    if (!isServer) {
      Object.assign(config.resolve.alias, {
        fs: false,
        readline: false,
      });
    }
    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: [/the request of a dependency is an expression/],
      }),
    );
    if (isServer) {
      Object.assign(config.externals, {
        snarkjs: "snarkjs",
      });
    }
    // config.externals = {
    //   snarkjs: "snarkjs",
    // };
    Object.assign(config.experiments, {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    });
    return config;
  },
  // transpilePackages: ["snarkjs"],
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["mongoose", "snarkjs"],
  },
  modularizeImports: {
    "@mui/icons-material/?(((\\w*)?/?)*)": {
      transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}",
    },
  },
  transpilePackages: ["@mui/system", "@mui/material", "@mui/icons-material"],
};

module.exports = withPWA(nextConfig);
