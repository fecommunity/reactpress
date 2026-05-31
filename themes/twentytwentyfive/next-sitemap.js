const { config } = require('@fecommunity/reactpress-toolkit');

const siteUrl =
  process.env.CLIENT_SITE_URL?.trim() ||
  config.config?.CLIENT_SITE_URL?.trim() ||
  'http://localhost:3001';

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: '/admin/' }],
  },
  exclude: ['/admin', '/admin/**'],
};
