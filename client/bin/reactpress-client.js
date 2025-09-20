#!/usr/bin/env node

/**
 * ReactPress Client CLI Entry Point
 * This script allows starting the ReactPress client via npx
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
ReactPress Client - Next.js-based frontend for ReactPress CMS

Usage:
  npx @fecommunity/reactpress-client [options]

Options:
  --pm2        Start client with PM2 process manager
  --help, -h   Show this help message

Examples:
  npx @fecommunity/reactpress-client          # Start client normally
  npx @fecommunity/reactpress-client --pm2    # Start client with PM2
  npx @fecommunity/reactpress-client --help   # Show this help message
  `);
  process.exit(0);
}

// Get the directory where this script is located
const binDir = __dirname;
const clientDir = path.join(binDir, '..');
const nextDir = path.join(clientDir, '.next');

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

// Function to start with regular Node.js (npm start)
function startWithNode() {
  // Check if the app is built
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

  // ONLY set the environment variable if it's not already set
  // This preserves the value set by set-env.js when running pnpm dev from root
  if (!process.env.REACTPRESS_ORIGINAL_CWD) {
    process.env.REACTPRESS_ORIGINAL_CWD = originalCwd;
  } else {
    console.log(`[ReactPress Client] Using existing REACTPRESS_ORIGINAL_CWD: ${process.env.REACTPRESS_ORIGINAL_CWD}`);
  }

  // Change to the client directory
  process.chdir(clientDir);

  // Start with npm start
  console.log('[ReactPress Client] Starting with npm start...');
  const npmStart = spawn('npm', ['start'], {
    stdio: 'inherit',
    cwd: clientDir
  });

  npmStart.on('close', (code) => {
    console.log(`[ReactPress Client] npm start process exited with code ${code}`);
    process.exit(code);
  });

  npmStart.on('error', (error) => {
    console.error('[ReactPress Client] Failed to start with npm start:', error);
    process.exit(1);
  });
}

// Main execution
if (usePM2) {
  startWithPM2();
} else {
  startWithNode();
}