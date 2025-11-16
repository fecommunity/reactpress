#!/usr/bin/env node

// Enhanced Docker Development Script
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 获取当前工作目录
const currentWorkingDir = process.cwd();

// 设置环境变量
process.env.REACTPRESS_ORIGINAL_CWD = currentWorkingDir;

console.log(`[ReactPress] Setting REACTPRESS_ORIGINAL_CWD: ${currentWorkingDir}`);

// Helper function to check if Docker is running
function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to check if containers are running
function areContainersRunning() {
  try {
    const output = execSync('docker-compose -f docker-compose.dev.yml ps --services --filter "status=running"', { 
      encoding: 'utf-8' 
    });
    const services = output.trim().split('\n').filter(line => line.length > 0);
    return services.length >= 2; // db and nginx
  } catch (error) {
    return false;
  }
}

// Helper function to stop Docker services
function stopDockerServices() {
  console.log('[ReactPress] Stopping Docker services...');
  try {
    execSync('docker-compose -f docker-compose.dev.yml down', { 
      stdio: 'inherit' 
    });
    console.log('[ReactPress] Docker services stopped successfully.');
  } catch (error) {
    console.error('[ReactPress] Error stopping Docker services:', error.message);
  }
}

// Helper function to start Docker services
function startDockerServices() {
  console.log('[ReactPress] Starting Docker services...');
  
  if (!isDockerRunning()) {
    console.error('[ReactPress] Docker is not running. Please start Docker first.');
    process.exit(1);
  }
  
  try {
    execSync('docker-compose -f docker-compose.dev.yml up -d', { 
      stdio: 'inherit' 
    });
    console.log('[ReactPress] Docker services started successfully.');
    return true;
  } catch (error) {
    console.error('[ReactPress] Error starting Docker services:', error.message);
    return false;
  }
}

// Helper function to wait for services to be ready
async function waitForServices() {
  console.log('[ReactPress] Waiting for services to be ready...');
  
  // Check MySQL connection
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait
  
  while (attempts < maxAttempts) {
    try {
      execSync('docker exec reactpress_db mysql -u reactpress -preactpress -e "SELECT 1"', { 
        stdio: 'ignore' 
      });
      console.log('[ReactPress] MySQL database is ready!');
      return true;
    } catch (error) {
      attempts++;
      if (attempts % 5 === 0) {
        console.log(`[ReactPress] Waiting for MySQL... (${attempts}/${maxAttempts})`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.error('[ReactPress] MySQL database failed to start within timeout period.');
  return false;
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'start';

switch (command) {
  case 'start':
    // Start Docker services and development server
    console.log('[ReactPress] Starting development environment...');
    
    if (!startDockerServices()) {
      process.exit(1);
    }
    
    waitForServices().then((ready) => {
      if (ready) {
        console.log('[ReactPress] Starting development server...');
        
        // 执行构建命令
        const build = spawn('pnpm', ['build:toolkit'], {
          stdio: 'inherit',
          shell: true
        });
        
        build.on('close', (code) => {
          if (code !== 0) {
            console.error(`[ReactPress] Build failed with exit code: ${code}`);
            process.exit(code);
          }
          
          console.log('[ReactPress] Toolkit built successfully.');
          console.log('[ReactPress] Starting client and server in development mode...');
          console.log('[ReactPress] Access your application at: http://localhost:8080');
          
          // 执行并发命令
          const concurrently = spawn('npx', [
            'concurrently',
            'pnpm:dev:server',
            'pnpm:dev:client'
          ], {
            stdio: 'inherit',
            shell: true,
            cwd: currentWorkingDir
          });
          
          concurrently.on('close', (code) => {
            process.exit(code);
          });
        });
      } else {
        console.error('[ReactPress] Failed to start services.');
        process.exit(1);
      }
    });
    break;
    
  case 'stop':
    // Stop Docker services
    stopDockerServices();
    break;
    
  case 'restart':
    // Restart Docker services
    console.log('[ReactPress] Restarting development environment...');
    stopDockerServices();
    
    setTimeout(() => {
      if (!startDockerServices()) {
        process.exit(1);
      }
    }, 2000);
    break;
    
  case 'status':
    // Show status of Docker services
    console.log('[ReactPress] Checking Docker services status...');
    try {
      execSync('docker-compose -f docker-compose.dev.yml ps', { 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.error('[ReactPress] Error checking Docker services status:', error.message);
    }
    break;
    
  case 'logs':
    // Show Docker logs
    console.log('[ReactPress] Showing Docker services logs...');
    try {
      const logService = args[1] || '';
      execSync(`docker-compose -f docker-compose.dev.yml logs -f ${logService}`, { 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.error('[ReactPress] Error showing Docker services logs:', error.message);
    }
    break;
    
  default:
    console.log(`
ReactPress Docker Development Environment

Usage: node scripts/docker-dev.js [command]

Commands:
  start   Start Docker services and development server (default)
  stop    Stop Docker services
  restart Restart Docker services
  status  Show status of Docker services
  logs    Show Docker services logs (optionally specify service: db, nginx)

Examples:
  node scripts/docker-dev.js
  node scripts/docker-dev.js stop
  node scripts/docker-dev.js logs db
    `);
    break;
}