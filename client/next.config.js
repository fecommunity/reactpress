const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const withPlugins = require('next-compose-plugins');
const withLess = require('next-with-less');
const withPWA = require('next-pwa');
const { config, locales, defaultLocale } = require('@fecommunity/reactpress-toolkit');
const antdVariablesFilePath = path.resolve(__dirname, './antd-custom.less');

const getServerApiUrl = () => {
  if (config.SERVER_URL) {
    return `${config.SERVER_SITE_URL}/api`;
  } else {
    return config.SERVER_API_URL || 'http://localhost:3002/api';
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: config.CLIENT_ASSET_PREFIX || '/',
  i18n: {
    locales: locales && locales.length > 0 ? locales : ['zh', 'en'],
    defaultLocale: defaultLocale || 'zh',
  },
  env: {
    SERVER_API_URL: getServerApiUrl(),
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
