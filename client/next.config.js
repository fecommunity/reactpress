const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const withPlugins = require('next-compose-plugins');
const withLess = require('next-with-less');
const withPWA = require('next-pwa');
const { config, locales, defaultLocale } = require('@reactpress/config');
const antdVariablesFilePath = path.resolve(__dirname, './antd-custom.less');

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: config.CLIENT_ASSET_PREFIX,
  i18n: {
    locales,
    defaultLocale,
  },
  env: {
    SERVER_API_URL: config.SERVER_API_URL || 'http://localhost:3002/api',
    GITHUB_CLIENT_ID: config.GITHUB_CLIENT_ID,
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
};

module.exports = withPlugins(
  [
    [
      withPWA,
      {
        pwa: {
          disable: process.env.NODE_ENV !== 'production',
          dest: '.next',
          sw: 'service-worker.js',
        },
      },
    ],
    [
      withLess,
      {
        lessLoaderOptions: {
          additionalData: (content) => `${content}\n\n@import '${antdVariablesFilePath}';`,
        },
      },
    ],
  ],
  nextConfig
);
