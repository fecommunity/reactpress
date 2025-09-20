#!/usr/bin/env node

/**
 * ReactPress Client CLI Entry Point
 * This script allows starting the ReactPress client via npx
 */

const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const url = require('url');

// Get command line arguments
const args = process.argv.slice(2);
const usePM2 = args.includes('--pm2');
const showHelp = args.includes('--help') || args.includes('-h');

// Show help if requested
if (showHelp) {
  console.log(`
ReactPress Client - Next.js-based frontend for ReactPress CMS

Usage:
  npx @fecommunity/reactpress-client [options]

Options:
  --pm2        Start client with PM2 process manager
  --help, -h   Show this help message

Examples:
  npx @fecommunity/reactpress-client          # Start client in development mode
  npx @fecommunity/reactpress-client --pm2    # Start client with PM2
  npx @fecommunity/reactpress-client --help   # Show this help message
  `);
  process.exit(0);
}

// Get the directory where this script is located
const binDir = __dirname;
const clientDir = path.join(binDir, '..');

// Change to the client directory
process.chdir(clientDir);

// Try to load configuration
let port = 3001;
let clientSiteUrl = 'http://localhost:3001';

try {
  const { config } = require('@fecommunity/reactpress-config');
  
  // Extract port from CLIENT_SITE_URL or use CLIENT_PORT
  if (config.CLIENT_SITE_URL) {
    try {
      const parsedUrl = url.parse(config.CLIENT_SITE_URL);
      if (parsedUrl.port) {
        port = parseInt(parsedUrl.port, 10);
      } else if (parsedUrl.protocol === 'https:') {
        port = 443;
      } else {
        port = 80;
      }
      clientSiteUrl = config.CLIENT_SITE_URL;
    } catch (err) {
      console.warn('[ReactPress Client] Failed to parse CLIENT_SITE_URL, using default port 3001');
    }
  } else if (config.CLIENT_PORT) {
    port = parseInt(config.CLIENT_PORT, 10);
  }
} catch (err) {
  console.warn('[ReactPress Client] Failed to load configuration, using default settings');
}

// Function to check if PM2 is installed
function isPM2Installed() {
  try {
    require.resolve('pm2');
    return true;
  } catch (e) {
    // Check if PM2 is installed globally
    try {
      spawnSync('pm2', ['--version'], { stdio: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Function to install PM2
function installPM2() {
  console.log('[ReactPress Client] Installing PM2...');
  const installResult = spawnSync('npm', ['install', 'pm2', '--no-save'], {
    stdio: 'inherit',
    cwd: clientDir
  });
  
  if (installResult.status !== 0) {
    console.error('[ReactPress Client] Failed to install PM2');
    return false;
  }
  
  return true;
}

// Function to start with PM2
function startWithPM2() {
  // Check if PM2 is installed
  if (!isPM2Installed()) {
    // Try to install PM2
    if (!installPM2()) {
      console.error('[ReactPress Client] Cannot start with PM2');
      process.exit(1);
    }
  }
  
  // Check if the client is built
  const nextDir = path.join(clientDir, '.next');
  if (!fs.existsSync(nextDir)) {
    console.log('[ReactPress Client] Client not built yet. Building...');
    
    // Try to build the client
    const buildResult = spawnSync('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: clientDir
    });
    
    if (buildResult.status !== 0) {
      console.error('[ReactPress Client] Failed to build client');
      process.exit(1);
    }
  }
  
  console.log('[ReactPress Client] Starting with PM2...');
  
  // Use PM2 to start the Next.js production server
  let pm2Command = 'pm2';
  try {
    // Try to resolve PM2 path
    pm2Command = path.join(clientDir, 'node_modules', '.bin', 'pm2');
    if (!fs.existsSync(pm2Command)) {
      pm2Command = 'pm2';
    }
  } catch (e) {
    pm2Command = 'pm2';
  }
  
  // Start with PM2 using direct command
  const pm2 = spawn(pm2Command, ['start', 'npm', '--name', 'reactpress-client', '--', 'run', 'start'], {
    stdio: 'inherit',
    cwd: clientDir
  });
  
  pm2.on('close', (code) => {
    console.log(`[ReactPress Client] PM2 process exited with code ${code}`);
    process.exit(code);
  });
  
  pm2.on('error', (error) => {
    console.error('[ReactPress Client] Failed to start with PM2:', error);
    process.exit(1);
  });
}

// Function to start with regular Node.js
function startWithNode() {
  // Check if we're in development or production mode
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    // In development mode, start Next.js dev server
    console.log('[ReactPress Client] Starting Next.js development server...');
    
    // Use Next.js CLI directly
    const nextDev = spawn('npx', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
      cwd: clientDir
    });
    
    nextDev.on('close', (code) => {
      console.log(`[ReactPress Client] Next.js dev server exited with code ${code}`);
      process.exit(code);
    });
    
    nextDev.on('error', (error) => {
      console.error('[ReactPress Client] Failed to start Next.js dev server:', error);
      process.exit(1);
    });
  } else {
    // In production mode, check if the app is built and start it
    const nextDir = path.join(clientDir, '.next');
    
    if (!fs.existsSync(nextDir)) {
      console.log('[ReactPress Client] Client not built yet. Building...');
      
      // Try to build the client
      const buildResult = spawnSync('npm', ['run', 'build'], {
        stdio: 'inherit',
        cwd: clientDir
      });
      
      if (buildResult.status !== 0) {
        console.error('[ReactPress Client] Failed to build client');
        process.exit(1);
      }
    }
    
    console.log('[ReactPress Client] Starting Next.js production server...');
    
    // Start Next.js production server
    const nextStart = spawn('npx', ['next', 'start', '-p', port.toString()], {
      stdio: 'inherit',
      cwd: clientDir
    });
    
    nextStart.on('close', (code) => {
      console.log(`[ReactPress Client] Next.js production server exited with code ${code}`);
      process.exit(code);
    });
    
    nextStart.on('error', (error) => {
      console.error('[ReactPress Client] Failed to start Next.js production server:', error);
      process.exit(1);
    });
  }
}

console.log(`[ReactPress Client] Starting client on port ${port}...`);

// Main execution
if (usePM2) {
  startWithPM2();
} else {
  startWithNode();
}

// Try to automatically open browser after a short delay (only in dev mode and not with PM2)
if (!usePM2 && process.env.NODE_ENV !== 'production') {
  setTimeout(() => {
    try {
      require('open')(clientSiteUrl);
    } catch (err) {
      console.warn('[ReactPress Client] Failed to open browser automatically');
    }
  }, 3000);
}