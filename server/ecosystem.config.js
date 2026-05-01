const path = require('path');
const { getBundledServerMain } = require('./lib/bundled-server-path');

module.exports = {
  apps: [
    {
      name: 'reactpress-server',
      script: getBundledServerMain(),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
