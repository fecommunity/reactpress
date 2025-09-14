#!/usr/bin/env node

const express = require('express');
const mysql = require('mysql2/promise');
const chalk = require('chalk');
const open = require('open');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3003;
const envPath = path.join(process.cwd(), '.env');

// WordPress-style 5-minute installation
async function install() {
  console.log(chalk.blue('🚀 ReactPress 5-Minute Installation'));
  console.log(chalk.cyan('🌍 Starting installation wizard...'));
  
  const app = express();
  app.use(express.json());
  app.get('/', (req, res) => res.send(getHTML()));
  
  app.post('/test-db', async (req, res) => {
    const { host, port, user, password, database } = req.body;
    try {
      const conn = await mysql.createConnection({ host, port: parseInt(port), user, password });
      await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4`);
      await conn.end();
      res.json({ success: true, message: 'Database connection successful!' });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });
  
  app.post('/install', async (req, res) => {
    const { db, site } = req.body;
    const env = `DB_HOST=${db.host}\nDB_PORT=${db.port}\nDB_USER=${db.user}\nDB_PASSWD=${db.password}\nDB_DATABASE=${db.database}\nCLIENT_SITE_URL=${site.clientUrl}\nSERVER_SITE_URL=${site.serverUrl}\nJWT_SECRET=${crypto.randomBytes(32).toString('hex')}\n`;
    fs.writeFileSync(envPath, env);
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
  spawn('npm', ['run', 'start:dev'], { cwd: path.resolve(__dirname, '../server'), stdio: 'inherit' });
}

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