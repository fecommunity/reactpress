#!/usr/bin/env node

const express = require('express');
const mysql = require('mysql2/promise');
const chalk = require('chalk');
const open = require('open');
const fs = require('fs');
const path = require('path');

const PORT = 3003;
const envPath = path.join(process.cwd(), 'server', '.env');

// WordPress-style 5-minute installation
async function install() {
  console.log(chalk.blue('🚀 ReactPress 5-Minute Installation'));
  console.log(chalk.cyan('🌍 Starting installation wizard...'));
  
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get('/', (req, res) => res.send(getWordPressHTML()));
  
  // Enhanced database testing with proper error handling
  app.post('/test-db', async (req, res) => {
    const { host, port, user, password, database } = req.body;
    
    // Input validation
    if (!host || !port || !user || !database) {
      return res.json({ 
        success: false, 
        message: 'All database fields are required.' 
      });
    }
    
    try {
      console.log(chalk.cyan(`Testing connection to ${user}@${host}:${port}/${database}...`));
      
      // Test basic connection first
      const conn = await mysql.createConnection({
        host: host.trim(),
        port: parseInt(port),
        user: user.trim(),
        password: password,
        connectTimeout: 5000,
        acquireTimeout: 5000,
        timeout: 5000
      });
      
      // Test if we can access the specific database
      try {
        // Use query instead of execute for USE statement
        await conn.query(`USE \`${database.trim()}\``);
        console.log(chalk.green(`Database '${database}' exists and accessible`));
      } catch (dbError) {
        if (dbError.code === 'ER_BAD_DB_ERROR') {
          // Database doesn't exist, try to create it
          await conn.query(`CREATE DATABASE \`${database.trim()}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
          console.log(chalk.green(`Database '${database}' created successfully`));
        } else {
          throw dbError;
        }
      }
      
      await conn.end();
      console.log(chalk.green('✅ Database connection test passed'));
      
      res.json({ 
        success: true, 
        message: `Successfully connected to database '${database}' on ${host}:${port}` 
      });
      
    } catch (error) {
      console.log(chalk.red('❌ Database connection failed:'), error.message);
      
      let errorMessage = 'Database connection failed: ';
      
      switch (error.code) {
        case 'ECONNREFUSED':
          errorMessage += `Cannot connect to MySQL server at ${host}:${port}. Please ensure MySQL is running.`;
          break;
        case 'ER_ACCESS_DENIED_ERROR':
          errorMessage += `Access denied for user '${user}'. Please check your username and password.`;
          break;
        case 'ENOTFOUND':
          errorMessage += `Host '${host}' not found. Please check the hostname.`;
          break;
        case 'ETIMEDOUT':
          errorMessage += `Connection timeout to ${host}:${port}. Please check your network and firewall settings.`;
          break;
        case 'ER_BAD_DB_ERROR':
          errorMessage += `Database '${database}' does not exist and cannot be created. Please check your permissions.`;
          break;
        default:
          errorMessage += error.message;
      }
      
      res.json({ success: false, message: errorMessage });
    }
  });
  
  app.post('/install', async (req, res) => {
    const { db, site } = req.body;
    
    // Final validation before installation
    try {
      const testConn = await mysql.createConnection({
        host: db.host.trim(),
        port: parseInt(db.port),
        user: db.user.trim(),
        password: db.password,
        database: db.database.trim()
      });
      await testConn.end();
    } catch (error) {
      return res.json({ 
        success: false, 
        message: 'Final database validation failed. Please test your connection again.' 
      });
    }
    
    const env = `# ReactPress Configuration
# Generated on ${new Date().toISOString()}

DB_HOST=${db.host}
DB_PORT=${db.port}
DB_USER=${db.user}
DB_PASSWD=${db.password}
DB_DATABASE=${db.database}
CLIENT_SITE_URL=${site.clientUrl}
SERVER_SITE_URL=${site.serverUrl}
`;
    
    fs.writeFileSync(envPath, env);
    console.log(chalk.green('✅ Configuration saved to .env file'));
    
    res.json({ success: true, message: 'ReactPress installed successfully!' });
    
    setTimeout(() => {
      console.log(chalk.green('\n🎉 Installation completed!'));
      console.log(chalk.cyan('Run: npx reactpress-server start'));
      process.exit(0);
    }, 2000);
  });
  
  const server = app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(chalk.green(`✅ Installation wizard: ${url}`));
    open(url);
    console.log(chalk.gray('Press Ctrl+C to cancel\n'));
  });
  
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n⚠️ Installation cancelled'));
    server.close();
    process.exit(0);
  });
}

function start() {
  if (!fs.existsSync(envPath)) {
    console.log(chalk.red('❌ No configuration found!'));
    console.log(chalk.yellow('Run: npx reactpress-server install'));
    return;
  }
  console.log(chalk.blue('🚀 Starting ReactPress Server...'));
  const { spawn } = require('child_process');
  spawn('npm', ['run', 'dev'], { cwd: path.resolve(__dirname, '../server'), stdio: 'inherit' });
}

function getWordPressHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReactPress › Installation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            background: #f1f1f1;
            color: #444;
            line-height: 1.4;
        }
        
        .wp-container {
            max-width: 600px;
            margin: 40px auto;
            background: #fff;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        
        .wp-header {
            background: #0073aa;
            color: #fff;
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid #005a87;
        }
        
        .wp-header h1 {
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 8px;
        }
        
        .wp-header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .wp-content {
            padding: 24px;
        }
        
        .wp-step {
            display: none;
        }
        
        .wp-step.active {
            display: block;
        }
        
        .wp-step h2 {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1d2327;
        }
        
        .wp-description {
            background: #f0f6fc;
            border: 1px solid #c3e4f0;
            border-left: 4px solid #0073aa;
            padding: 12px 16px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #0c4a6e;
        }
        
        .wp-form-table {
            width: 100%;
            margin-bottom: 20px;
        }
        
        .wp-form-table th {
            text-align: left;
            padding: 10px 0;
            width: 140px;
            vertical-align: top;
            font-weight: 600;
            color: #1d2327;
        }
        
        .wp-form-table td {
            padding: 10px 0;
        }
        
        .wp-form-table input[type="text"],
        .wp-form-table input[type="password"],
        .wp-form-table input[type="number"],
        .wp-form-table input[type="url"] {
            width: 100%;
            max-width: 320px;
            padding: 8px 12px;
            border: 1px solid #8c8f94;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.4;
            transition: border-color 0.15s ease-in-out;
        }
        
        .wp-form-table input:focus {
            border-color: #0073aa;
            outline: 0;
            box-shadow: 0 0 0 1px #0073aa;
        }
        
        .wp-form-table .description {
            font-size: 13px;
            color: #646970;
            margin-top: 4px;
        }
        
        .wp-button {
            background: #0073aa;
            color: #fff;
            border: 1px solid #0073aa;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
            text-decoration: none;
            display: inline-block;
        }
        
        .wp-button:hover {
            background: #005a87;
            border-color: #005a87;
        }
        
        .wp-button:disabled {
            background: #f0f0f1;
            border-color: #dcdcde;
            color: #a7aaad;
            cursor: not-allowed;
        }
        
        .wp-button.button-large {
            padding: 12px 24px;
            font-size: 16px;
        }
        
        .wp-notice {
            border: 1px solid #c3c4c7;
            border-left-width: 4px;
            padding: 12px;
            margin: 16px 0;
            background: #fff;
        }
        
        .wp-notice.notice-success {
            border-left-color: #00a32a;
            background: #f7fcf7;
        }
        
        .wp-notice.notice-error {
            border-left-color: #d63638;
            background: #fcf2f2;
        }
        
        .wp-notice p {
            margin: 0;
            font-size: 14px;
        }
        
        .wp-progress {
            background: #f0f0f1;
            height: 4px;
            margin-bottom: 20px;
        }
        
        .wp-progress-bar {
            background: #0073aa;
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .wp-loader {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #0073aa;
            border-radius: 50%;
            animation: wp-spin 1s linear infinite;
            margin-right: 8px;
        }
        
        @keyframes wp-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .wp-footer {
            background: #f6f7f7;
            border-top: 1px solid #c3c4c7;
            padding: 16px 24px;
            text-align: center;
            font-size: 13px;
            color: #646970;
        }
        
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="wp-container">
        <div class="wp-header">
            <h1>ReactPress</h1>
            <p>5-Minute Installation</p>
        </div>
        
        <div class="wp-progress">
            <div class="wp-progress-bar" id="progressBar" style="width: 33%;"></div>
        </div>
        
        <div class="wp-content">
            <!-- Step 1: Database Configuration -->
            <div class="wp-step active" id="step1">
                <h2>Database Connection Information</h2>
                
                <div class="wp-description">
                    You should have this information available from your web hosting provider. If you don't have it, contact them before continuing.
                </div>
                
                <table class="wp-form-table">
                    <tr>
                        <th><label for="dbHost">Database Host</label></th>
                        <td>
                            <input type="text" id="dbHost" value="127.0.0.1" />
                            <p class="description">Usually "localhost" or "127.0.0.1"</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="dbPort">Database Port</label></th>
                        <td>
                            <input type="number" id="dbPort" value="3306" />
                            <p class="description">Default MySQL port is 3306</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="dbUser">Username</label></th>
                        <td>
                            <input type="text" id="dbUser" value="" placeholder="Database username" />
                            <p class="description">Your MySQL username</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="dbPassword">Password</label></th>
                        <td>
                            <input type="password" id="dbPassword" value="" placeholder="Database password" />
                            <p class="description">Your MySQL password</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="dbName">Database Name</label></th>
                        <td>
                            <input type="text" id="dbName" value="reactpress" />
                            <p class="description">The name of the database you want to use with ReactPress</p>
                        </td>
                    </tr>
                </table>
                
                <div id="dbResult"></div>
                
                <p class="text-center">
                    <button class="wp-button button-large" onclick="testDatabase()" id="testBtn">
                        Test Database Connection
                    </button>
                </p>
            </div>
            
            <!-- Step 2: Site Configuration -->
            <div class="wp-step" id="step2">
                <h2>Site Information</h2>
                
                <div class="wp-description">
                    Please provide the following information. Don't worry, you can always change these settings later.
                </div>
                
                <table class="wp-form-table">
                    <tr>
                        <th><label for="clientUrl">Client Site URL</label></th>
                        <td>
                            <input type="url" id="clientUrl" value="http://localhost:3001" />
                            <p class="description">The URL where your ReactPress frontend will be accessible</p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="serverUrl">API Server URL</label></th>
                        <td>
                            <input type="url" id="serverUrl" value="http://localhost:3002" />
                            <p class="description">The URL where your ReactPress API server will run</p>
                        </td>
                    </tr>
                </table>
                
                <div id="installResult"></div>
                
                <p class="text-center">
                    <button class="wp-button button-large" onclick="installReactPress()" id="installBtn">
                        Install ReactPress
                    </button>
                </p>
            </div>
            
            <!-- Step 3: Success -->
            <div class="wp-step" id="step3">
                <h2>Success!</h2>
                
                <div class="wp-notice notice-success">
                    <p><strong>ReactPress has been installed successfully!</strong></p>
                </div>
                
                <p>Your ReactPress installation is now complete. You can now:</p>
                
                <ul style="margin: 16px 0 16px 20px;">
                    <li>Close this browser window</li>
                    <li>Run <code>npx reactpress-server start</code> to start your server</li>
                    <li>Visit your ReactPress site at the URLs you configured</li>
                </ul>
            </div>
        </div>
        
        <div class="wp-footer">
            <p>Need help? <a href="https://github.com/fecommunity/reactpress/issues" target="_blank">ReactPress Documentation</a></p>
        </div>
    </div>
    
    <script>
        let currentStep = 1;
        const totalSteps = 3;
        let isTestingConnection = false;
        
        function updateProgress() {
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }
        
        function showStep(step) {
            document.querySelectorAll('.wp-step').forEach(s => s.classList.remove('active'));
            document.getElementById('step' + step).classList.add('active');
            currentStep = step;
            updateProgress();
        }
        
        function showNotice(message, type = 'error', containerId = 'dbResult') {
            const container = document.getElementById(containerId);
            container.innerHTML = \`
                <div class="wp-notice notice-\${type}">
                    <p>\${message}</p>
                </div>
            \`;
        }
        
        function validateDatabaseInputs() {
            const host = document.getElementById('dbHost').value.trim();
            const port = document.getElementById('dbPort').value.trim();
            const user = document.getElementById('dbUser').value.trim();
            const password = document.getElementById('dbPassword').value;
            const database = document.getElementById('dbName').value.trim();
            
            if (!host || !port || !user || !database) {
                showNotice('Please fill in all required fields.', 'error');
                return false;
            }
            
            if (isNaN(port) || port < 1 || port > 65535) {
                showNotice('Please enter a valid port number (1-65535).', 'error');
                return false;
            }
            
            return { host, port, user, password, database };
        }
        
        async function testDatabase() {
            if (isTestingConnection) return;
            
            const dbData = validateDatabaseInputs();
            if (!dbData) return;
            
            isTestingConnection = true;
            const testBtn = document.getElementById('testBtn');
            const originalText = testBtn.innerHTML;
            
            testBtn.disabled = true;
            testBtn.innerHTML = '<span class="wp-loader"></span>Testing connection...';
            
            try {
                const response = await fetch('/test-db', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dbData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotice(result.message, 'success');
                    setTimeout(() => {
                        showStep(2);
                    }, 1500);
                } else {
                    showNotice(result.message, 'error');
                }
            } catch (error) {
                showNotice('Failed to connect to server. Please try again.', 'error');
            } finally {
                isTestingConnection = false;
                testBtn.disabled = false;
                testBtn.innerHTML = originalText;
            }
        }
        
        async function installReactPress() {
            const dbData = validateDatabaseInputs();
            if (!dbData) {
                showStep(1);
                return;
            }
            
            const clientUrl = document.getElementById('clientUrl').value.trim();
            const serverUrl = document.getElementById('serverUrl').value.trim();
            
            if (!clientUrl || !serverUrl) {
                showNotice('Please fill in all site URLs.', 'error', 'installResult');
                return;
            }
            
            const installBtn = document.getElementById('installBtn');
            const originalText = installBtn.innerHTML;
            
            installBtn.disabled = true;
            installBtn.innerHTML = '<span class="wp-loader"></span>Installing ReactPress...';
            
            try {
                const response = await fetch('/install', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        db: dbData,
                        site: { clientUrl, serverUrl }
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showStep(3);
                } else {
                    showNotice(result.message, 'error', 'installResult');
                }
            } catch (error) {
                showNotice('Installation failed. Please try again.', 'error', 'installResult');
            } finally {
                installBtn.disabled = false;
                installBtn.innerHTML = originalText;
            }
        }
        
        // Initialize progress bar
        updateProgress();
        
        // Auto-focus first input
        document.getElementById('dbHost').focus();
    </script>
</body>
</html>`;
}

// Main entry point
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === 'install') {
  install();
} else if (args[0] === 'start') {
  start();
} else {
  console.log(chalk.blue('ReactPress Server CLI'));
  console.log(chalk.gray('npx reactpress-server         # Install'));
  console.log(chalk.gray('npx reactpress-server start   # Start server'));
}