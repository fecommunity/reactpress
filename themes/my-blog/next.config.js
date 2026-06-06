const path = require('path');
const { config } = require('@fecommunity/reactpress-toolkit/config');
const { resolveThemeNextEnv } = require('@fecommunity/reactpress-toolkit/theme/next-config');

// App Router (Next 15): do not use createReactPressNextConfig's react webpack alias —
// it conflicts with Next's compiled React and causes SSR "useContext" null errors.
// Server code imports `@fecommunity/reactpress-toolkit/theme/server` (no UI barrel).

const themeApiEnv = resolveThemeNextEnv();
const apiOrigin = themeApiEnv.SERVER_API_URL.replace(/\/api\/?$/, '');

const basePath = process.env.BASE_PATH || undefined;
const output = process.env.EXPORT ? 'export' : undefined;

/** @type {import('next').NextConfig} */
module.exports = {
  output,
  basePath,
  outputFileTracingRoot: path.join(__dirname, '../..'),
  ...(config.CLIENT_ASSET_PREFIX ? { assetPrefix: config.CLIENT_ASSET_PREFIX } : {}),
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  transpilePackages: ['@fecommunity/reactpress-toolkit'],
  experimental: {
    optimizePackageImports: ['@fecommunity/reactpress-toolkit', '@fecommunity/reactpress-toolkit/ui'],
    // Avoid SegmentViewNode manifest corruption in dev (Next 15.5+).
    devtoolSegmentExplorer: false,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  env: {
    ...themeApiEnv,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: process.env.UNOPTIMIZED ? true : undefined,
  },
  webpack: (webpackConfig) => {
    webpackConfig.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return webpackConfig;
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: '/tags/:tag', destination: '/tag/:tag', permanent: true },
      { source: '/tags/:tag/page/:page', destination: '/tag/:tag', permanent: true },
      { source: '/page/suggestions', destination: '/suggestions', permanent: true },
      { source: '/page/suggestions/', destination: '/suggestions/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
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
};
