#!/usr/bin/env node

/**
 * ReactPress CLI - Main entry point for all ReactPress commands
 * This script allows users to run reactpress commands after installing the package globally
 */

const { Command } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');

// Create the CLI program
const program = new Command();

// Get the directory where this script is located
const binDir = __dirname;
const rootDir = path.join(binDir, '..');

// Server command
program
  .command('server')
  .description('Manage the ReactPress server')
  .option('install', 'Launch the installation wizard')
  .option('start', 'Start the ReactPress server')
  .option('--pm2', 'Start server with PM2 process manager')
  .action((options) => {
    const serverScript = path.join(rootDir, 'scripts', 'reactpress-server.js');
    
    let args = [];
    if (options.install) {
      args.push('install');
    } else if (options.start) {
      args.push('start');
    }
    
    if (options.pm2) {
      args.push('--pm2');
    }
    
    const serverProcess = spawn('node', [serverScript, ...args], {
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (error) => {
      console.error(chalk.red('[ReactPress CLI] Failed to start server:'), error);
      process.exit(1);
    });
  });

// Client command
program
  .command('client')
  .description('Manage the ReactPress client')
  .option('--pm2', 'Start client with PM2 process manager')
  .action((options) => {
    const clientScript = path.join(rootDir, 'client', 'bin', 'reactpress-client.js');
    
    let args = [];
    if (options.pm2) {
      args.push('--pm2');
    }
    
    const clientProcess = spawn('node', [clientScript, ...args], {
      stdio: 'inherit'
    });
    
    clientProcess.on('error', (error) => {
      console.error(chalk.red('[ReactPress CLI] Failed to start client:'), error);
      process.exit(1);
    });
  });

// Set the version from package.json
const packageJson = require(path.join(rootDir, 'package.json'));
program.version(packageJson.version);

// Configure help text
program.on('--help', () => {
  console.log('');
  console.log('For more information, visit: https://github.com/fecommunity/reactpress');
});

// Parse the command line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}