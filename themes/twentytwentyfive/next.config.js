const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const withPlugins = require('next-compose-plugins');
const withLess = require('next-with-less');
const withPWA = require('next-pwa');
const { config } = require('@fecommunity/reactpress-toolkit');
const antdVariablesFilePath = path.resolve(__dirname, './antd-custom.less');

const getServerApiUrl = () => {
  if (config.SERVER_URL) {
    return `${config.SERVER_SITE_URL}/api`;
  } else {
    return config.SERVER_API_URL || `${process.env.SERVER_SITE_URL}/api` || 'http://localhost:3002/api';
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: config.CLIENT_ASSET_PREFIX || '/',
  i18n: {
    locales: config.locales && config.locales.length > 0 ? config.locales : ['zh', 'en'],
    defaultLocale: config.defaultLocale || 'zh',
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

const STRIP_ROOT_KEYS = ['webpackDevMiddleware', 'configOrigin', 'target', 'webpack5'];

function sanitizeExportedConfig(config) {
  const out = { ...config };
  for (const key of STRIP_ROOT_KEYS) {
    delete out[key];
  }
  if (out.amp?.canonicalBase === '') delete out.amp;
  if (out.experimental?.outputFileTracingRoot === '') {
    const { outputFileTracingRoot, ...experimental } = out.experimental;
    if (Object.keys(experimental).length > 0) {
      out.experimental = experimental;
    } else {
      delete out.experimental;
    }
  }
  return out;
}

const withComposedPlugins = withPlugins(
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

/** next-compose-plugins returns a function — must not spread it into a plain object. */
module.exports = (phase, ctx) => {
  const resolved =
    typeof withComposedPlugins === 'function'
      ? withComposedPlugins(phase, ctx)
      : withComposedPlugins;
  return sanitizeExportedConfig(resolved);
};