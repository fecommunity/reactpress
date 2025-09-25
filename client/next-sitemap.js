const { config } = require('@fecommunity/reactpress-toolkit');

module.exports = {
  siteUrl: config.CLIENT_SITE_URL,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: '/admin/' }],
  },
  exclude: ['/admin', '/admin/**'],
};
