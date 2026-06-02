const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { config } = require('@fecommunity/reactpress-toolkit');
const {
  createReactPressNextConfig,
  resolveThemeNextEnv,
} = require('@fecommunity/reactpress-toolkit/theme/next-config');

const themeApiEnv = resolveThemeNextEnv();
const apiOrigin = themeApiEnv.SERVER_API_URL.replace(/\/api\/?$/, '');

/** @type {import('next').NextConfig} */
module.exports = createReactPressNextConfig({
  assetPrefix: config.CLIENT_ASSET_PREFIX || '/',
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  env: {
    ...themeApiEnv,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    if (!isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          contentVendor: {
            test: /[\\/]node_modules[\\/](highlight\.js|viewerjs)[\\/]/,
            name: 'content-vendor',
            chunks: 'async',
            priority: 30,
          },
        },
      };
    }
    return config;
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
});
