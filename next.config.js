const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
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
    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: [/the request of a dependency is an expression/],
      }),
    );
    // if (isServer) {
    //   Object.assign(config.resolve.fallback, { snarkjs: require.resolve("snarkjs") });
    // }
    config.externals = {
      snarkjs: "snarkjs",
    };
    // config.experiments = { asyncWebAssembly: true, syncWebAssembly: true, layers: true };
    return config;
  },
  // transpilePackages: ["snarkjs"],
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  modularizeImports: {
    "@mui/icons-material/?(((\\w*)?/?)*)": {
      transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}",
    },
  },
  transpilePackages: ["@mui/system", "@mui/material", "@mui/icons-material"],
};

module.exports = nextConfig;
