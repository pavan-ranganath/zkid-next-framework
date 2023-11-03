const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");

const isDev = process.env.NODE_ENV !== "production";
const path = require("path");
const withPWAInit = require("next-pwa");

/** @type {import('next-pwa').PWAConfig} */
const withPWA = withPWAInit({
  disable: isDev,
  dest: "public",
  // Solution: https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1399683017
  buildExcludes: ["app-build-manifest.json"],
});

const generateAppDirEntry = (entry) => {
  const packagePath = require.resolve("next-pwa");
  const packageDirectory = path.dirname(packagePath);
  const registerJs = path.join(packageDirectory, "register.js");

  return entry().then((entries) => {
    const modifiedEntries = { ...entries }; // Create a copy of the 'entries' object

    // Register SW on App directory, solution: https://github.com/shadowwalker/next-pwa/pull/427
    if (modifiedEntries["main-app"] && !modifiedEntries["main-app"].includes(registerJs)) {
      if (Array.isArray(modifiedEntries["main-app"])) {
        modifiedEntries["main-app"].unshift(registerJs);
      } else if (typeof modifiedEntries["main-app"] === "string") {
        modifiedEntries["main-app"] = [registerJs, modifiedEntries["main-app"]];
      }
    }
    return modifiedEntries; // Return the modified copy
  });
};

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
    const newConfig = { ...config }; // Create a copy of the 'config' object
    if (!isDev) {
      const entry = generateAppDirEntry(config.entry);
      newConfig.entry = () => entry;
    }

    return newConfig;
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
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
