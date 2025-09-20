#!/usr/bin/env node

/**
 * ReactPress Server CLI Entry Point
 * This script allows starting the ReactPress server via npx
 * Supports both regular and PM2 startup modes
 */

const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');

// Capture the original working directory where npx was executed
// BUT prioritize the REACTPRESS_ORIGINAL_CWD environment variable if it exists
// This ensures consistency when running via pnpm dev from root directory
const originalCwd = process.env.REACTPRESS_ORIGINAL_CWD || process.cwd();

// Get command line arguments
const args = process.argv.slice(2);
const usePM2 = args.includes('--pm2');
const showHelp = args.includes('--help') || args.includes('-h');

// Show help if requested
if (showHelp) {
  console.log(`
ReactPress Server - NestJS-based backend API for ReactPress CMS

Usage:
  npx @fecommunity/reactpress-server [options]

Options:
  --pm2        Start server with PM2 process manager
  --help, -h   Show this help message

Examples:
  npx @fecommunity/reactpress-server          # Start server normally
  npx @fecommunity/reactpress-server --pm2    # Start server with PM2
  npx @fecommunity/reactpress-server --help   # Show this help message
  `);
  process.exit(0);
}

// Get the directory where this script is located
const binDir = __dirname;
const serverDir = path.join(binDir, '..');
const distPath = path.join(serverDir, 'dist', 'main.js');
const ecosystemPath = path.join(serverDir, 'ecosystem.config.js');

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
  console.log('[ReactPress Server] Installing PM2...');
  const installResult = spawnSync('npm', ['install', 'pm2', '--no-save'], {
    stdio: 'inherit',
    cwd: serverDir
  });
  
  if (installResult.status !== 0) {
    console.error('[ReactPress Server] Failed to install PM2');
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
      console.error('[ReactPress Server] Cannot start with PM2');
      process.exit(1);
    }
  }
  
  // Check if the server is built
  if (!fs.existsSync(distPath)) {
    console.log('[ReactPress Server] Server not built yet. Building...');
    
    // Try to build the server
    const buildResult = spawnSync('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: serverDir
    });
    
    if (buildResult.status !== 0) {
      console.error('[ReactPress Server] Failed to build server');
      process.exit(1);
    }
  }
  
  console.log('[ReactPress Server] Starting with PM2...');
  
  // Use ecosystem.config.js if it exists, otherwise use direct command
  let pm2Command = 'pm2';
  try {
    // Try to resolve PM2 path
    pm2Command = path.join(serverDir, 'node_modules', '.bin', 'pm2');
    if (!fs.existsSync(pm2Command)) {
      pm2Command = 'pm2';
    }
  } catch (e) {
    pm2Command = 'pm2';
  }
  
  // Check if ecosystem.config.js exists
  if (fs.existsSync(ecosystemPath)) {
    const pm2 = spawn(pm2Command, ['start', ecosystemPath], {
      stdio: 'inherit',
      cwd: serverDir
    });
    
    pm2.on('close', (code) => {
      console.log(`[ReactPress Server] PM2 process exited with code ${code}`);
      process.exit(code);
    });
    
    pm2.on('error', (error) => {
      console.error('[ReactPress Server] Failed to start with PM2:', error);
      process.exit(1);
    });
  } else {
    // Fallback to direct start
    const pm2 = spawn(pm2Command, ['start', distPath, '--name', 'reactpress-server'], {
      stdio: 'inherit',
      cwd: serverDir
    });
    
    pm2.on('close', (code) => {
      console.log(`[ReactPress Server] PM2 process exited with code ${code}`);
      process.exit(code);
    });
    
    pm2.on('error', (error) => {
      console.error('[ReactPress Server] Failed to start with PM2:', error);
      process.exit(1);
    });
  }
}

// Function to start with regular Node.js
function startWithNode() {
  // Check if the server is built
  if (!fs.existsSync(distPath)) {
    console.log('[ReactPress Server] Server not built yet. Building...');
    
    // Try to build the server
    const buildResult = spawnSync('npm', ['run', 'build'], {
      stdio: 'inherit',
      cwd: serverDir
    });
    
    if (buildResult.status !== 0) {
      console.error('[ReactPress Server] Failed to build server');
      process.exit(1);
    }
  }

  // ONLY set the environment variable if it's not already set
  // This preserves the value set by set-env.js when running pnpm dev from root
  if (!process.env.REACTPRESS_ORIGINAL_CWD) {
    process.env.REACTPRESS_ORIGINAL_CWD = originalCwd;
  } else {
    console.log(`[ReactPress Server] Using existing REACTPRESS_ORIGINAL_CWD: ${process.env.REACTPRESS_ORIGINAL_CWD}`);
  }

  // Change to the server directory
  process.chdir(serverDir);

  // Set environment variables
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  // Import and run the server
  try {
    require(distPath);
  } catch (error) {
    console.error('[ReactPress Server] Failed to start server:', error);
    process.exit(1);
  }
}

// Main execution
if (usePM2) {
  startWithPM2();
} else {
  startWithNode();
}
