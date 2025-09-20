const { config } = require('@fecommunity/reactpress-config');
const cli = require('next/dist/cli/next-dev');
const { spawn } = require('child_process');

// Extract port from CLIENT_SITE_URL or default to 3001
let port = 3001;
if (config.CLIENT_SITE_URL) {
  try {
    const url = require('url');
    const parsedUrl = url.parse(config.CLIENT_SITE_URL);
    if (parsedUrl.port) {
      port = parseInt(parsedUrl.port, 10);
    } else if (parsedUrl.protocol === 'https:') {
      port = 443;
    } else {
      port = 80;
    }
  } catch (err) {
    console.warn('[ReactPress] Failed to parse CLIENT_SITE_URL, using default port 3001');
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const usePM2 = args.includes('--pm2');

if (usePM2) {
  // Check if PM2 is installed
  try {
    require.resolve('pm2');
  } catch (e) {
    // Check if PM2 is installed globally
    try {
      const { spawnSync } = require('child_process');
      spawnSync('pm2', ['--version'], { stdio: 'ignore' });
    } catch (e) {
      console.log('[ReactPress] PM2 not found. Installing PM2...');
      const { spawnSync } = require('child_process');
      const installResult = spawnSync('npm', ['install', 'pm2', '--no-save'], {
        stdio: 'inherit'
      });
      
      if (installResult.status !== 0) {
        console.error('[ReactPress] Failed to install PM2');
        process.exit(1);
      }
    }
  }
  
  // Use PM2 to start the Next.js development server
  console.log('[ReactPress] Starting client with PM2...');
  const pm2 = spawn('pm2', ['start', 'npm', '--name', 'reactpress-client', '--', 'run', 'dev'], {
    stdio: 'inherit'
  });
  
  pm2.on('close', (code) => {
    console.log(`[ReactPress] PM2 process exited with code ${code}`);
    process.exit(code);
  });
  
  pm2.on('error', (error) => {
    console.error('[ReactPress] Failed to start with PM2:', error);
    process.exit(1);
  });
} else {
  try {
    cli.nextDev(['-p', port.toString());
    console.log(`[ReactPress] 客户端已启动，端口：${port}`);
    // 自动打开
    require('open')(`http://localhost:${port}`);
  } catch (err) {
    console.log(`[ReactPress] 客户端启动失败！${err.message || err}`);
  }
}