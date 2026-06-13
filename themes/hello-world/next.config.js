const { createReactPressNextConfig } = require('@fecommunity/reactpress-toolkit/theme/next-config');

const apiOrigin = (
  process.env.SERVER_API_URL ||
  process.env.REACTPRESS_API_URL ||
  'http://localhost:3002/api'
).replace(/\/api\/?$/, '');

module.exports = createReactPressNextConfig({
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
      { source: '/public/:path*', destination: `${apiOrigin}/public/:path*` },
      { source: '/logo.png', destination: `${apiOrigin}/public/logo.png` },
      { source: '/favicon.png', destination: `${apiOrigin}/public/favicon.png` },
      { source: '/favicon.ico', destination: '/favicon.svg' },
    ];
  },
});
