module.exports = {
  apps: [
    {
      name: 'reactpress-server',
      script: './dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NGINX_ENTRY_URL: process.env.NGINX_ENTRY_URL || 'http://localhost',
        REACTPRESS_NGINX_ENTRY_URL: process.env.REACTPRESS_NGINX_ENTRY_URL || process.env.NGINX_ENTRY_URL || 'http://localhost',
        SERVER_PORT: process.env.SERVER_PORT || '13002',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};