const {
  createReactPressNextConfig,
  resolveThemeNextEnv,
} = require('@fecommunity/reactpress-toolkit/theme/next-config');

const apiOrigin = resolveThemeNextEnv().SERVER_API_URL.replace(/\/api\/?$/, '');

module.exports = createReactPressNextConfig({
  poweredByHeader: false,
  compress: true,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${apiOrigin}/api/:path*` },
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
      { source: '/logo.png', destination: `${apiOrigin}/public/logo.png` },
      { source: '/favicon.png', destination: `${apiOrigin}/public/favicon.png` },
      { source: '/favicon.ico', destination: '/favicon.svg' },
    ];
  },
});
