import * as fs from 'fs';
import { join, dirname } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as open from 'open';
import * as net from 'net';

// 全局状态管理
declare global {
  var installationServer: any;
  var installationPort: number;
  var isInstalling: boolean;
}

const INSTALLATION_PORT = 3002;
const MAX_PORT_ATTEMPTS = 10;

// 服务器状态跟踪
interface ServerState {
  server: any;
  isClosing: boolean;
  isListening: boolean;
}

const serverState: ServerState = {
  server: null,
  isClosing: false,
  isListening: false
};

// 增强的端口检测函数
const checkPort = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.once('close', () => resolve(true)).close();
    });
    server.listen(port);
  });
};

// 获取可用端口
const findAvailablePort = async (startPort: number): Promise<number> => {
  for (let port = startPort; port < startPort + MAX_PORT_ATTEMPTS; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found in range ${startPort}-${startPort + MAX_PORT_ATTEMPTS - 1}`);
};

// 安全关闭服务器
const safelyCloseServer = async (): Promise<void> => {
  if (!serverState.server || serverState.isClosing) {
    return;
  }
  
  serverState.isClosing = true;
  
  return new Promise((resolve) => {
    // 检查服务器是否仍在运行
    if (!serverState.isListening) {
      serverState.server = null;
      serverState.isClosing = false;
      resolve();
      return;
    }
    
    // 设置超时
    const timeout = setTimeout(() => {
      console.log('[ReactPress] Force closing server due to timeout');
      serverState.server = null;
      serverState.isClosing = false;
      serverState.isListening = false;
      resolve();
    }, 3000);
    
    // 尝试正常关闭
    serverState.server.close((err: any) => {
      clearTimeout(timeout);
      
      if (err && err.code !== 'ERR_SERVER_NOT_RUNNING') {
        console.warn('[ReactPress] Server close warning:', err.message);
      }
      
      serverState.server = null;
      serverState.isClosing = false;
      serverState.isListening = false;
      resolve();
    });
    
    // 强制关闭所有连接（如果可用）
    if (serverState.server.closeAllConnections) {
      serverState.server.closeAllConnections();
    }
  });
};

// 启动服务器并跟踪状态
const startServerWithState = (app: express.Express, port: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (serverState.server) {
      reject(new Error('Server is already running'));
      return;
    }
    
    const server = app.listen(port, () => {
      serverState.server = server;
      serverState.isListening = true;
      global.installationPort = port;
      console.log(`[ReactPress] Installation server running on http://localhost:${port}`);
      resolve();
    });
    
    server.on('error', (error: any) => {
      serverState.isListening = false;
      reject(error);
    });
    
    server.on('close', () => {
      serverState.isListening = false;
    });
  });
};

// 信号处理
const setupSignalHandlers = () => {
  const shutdown = async (signal: string) => {
    console.log(`\n[ReactPress] Received ${signal}, shutting down gracefully...`);
    
    await safelyCloseServer();
    
    process.exit(0);
  };
  
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));
};

// 主执行函数
const main = async () => {
  try {
    setupSignalHandlers();
    
    // 获取项目根目录路径（考虑npm包场景）
    const projectRoot = getProjectRoot();
    const envPath = join(projectRoot, '.env');
    
    console.log(`[ReactPress] Checking for environment file at: ${envPath}`);
    console.log(`[ReactPress] Project root determined to be: ${projectRoot}`);
    
    if (fs.existsSync(envPath)) {
      console.log('[ReactPress] Environment file exists, starting main application');
      await startMainApplication();
      return;
    }
    
    console.log('[ReactPress] Environment file not found, starting installation wizard');
    console.log('[ReactPress] Current working directory:', process.cwd());
    console.log('[ReactPress] __dirname:', __dirname);
    
    await runInstallationWizard();
    
  } catch (error) {
    console.error('[ReactPress] Fatal error:', error);
    // 确保服务器被正确关闭
    await safelyCloseServer();
    process.exit(1);
  }
};

// 获取项目根目录路径的函数
const getProjectRoot = (): string => {
  // 优先使用通过环境变量传递的原始工作目录
  // 这是在 bin/reactpress-server.js 中设置的，表示用户执行 npx 命令的目录
  if (process.env.REACTPRESS_ORIGINAL_CWD) {
    console.log(`[ReactPress] Using original working directory from npx execution: ${process.env.REACTPRESS_ORIGINAL_CWD}`);
    return process.env.REACTPRESS_ORIGINAL_CWD;
  }
  
  // 如果没有设置环境变量，则回退到当前工作目录
  const projectRoot = process.cwd();
  console.log(`[ReactPress] Using current working directory as project root: ${projectRoot}`);
  return projectRoot;
};

// 安装向导主函数
const runInstallationWizard = async (): Promise<void> => {
  try {
    // 查找可用端口
    const port = await findAvailablePort(INSTALLATION_PORT);
    
    const app = express();
    
    // 中间件配置
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    app.use('/public', express.static(join(__dirname, '../public')));
    
    // 路由
    app.get('/', (req, res) => {
      res.sendFile(join(__dirname, '../public/index.html'));
    });
    
    app.post('/test-db', async (req, res) => {
      try {
        const mysql = await import('mysql2/promise');
        const { host, port, user, password, database } = req.body;
        const connection = await mysql.createConnection({
          host: host || 'localhost',
          port: parseInt(port) || 3306,
          user,
          password,
          database
        });
        await connection.execute('SELECT 1');
        await connection.end();
        res.json({ success: true, message: 'Database connection successful!' });
      } catch (error: any) {
        res.status(400).json({ 
          success: false, 
          message: `Database connection failed: ${error.message}` 
        });
      }
    });
    
    app.post('/install', async (req, res) => {
      try {
        const { db, site } = req.body;
        if (!db || !site) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing configuration data' 
          });
        }
        
        // 测试数据库连接
        const mysql = await import('mysql2/promise');
        const connection = await mysql.createConnection({
          host: db.host || 'localhost',
          port: parseInt(db.port) || 3306,
          user: db.user,
          password: db.password,
          database: db.database
        });
        await connection.execute('SELECT 1');
        await connection.end();
        
        // 创建环境文件到项目根目录
        const envContent = `# Database Config
DB_HOST=${db.host || '127.0.0.1'}
DB_PORT=${db.port || 3306}
DB_USER=${db.user}
DB_PASSWD=${db.password}
DB_DATABASE=${db.database}

# Client Config
CLIENT_SITE_URL=${site.clientUrl || 'http://localhost:3001'}

# Server Config
SERVER_SITE_URL=${site.serverUrl || 'http://localhost:3002'}
`.trim();
        
        // 使用项目根目录路径创建.env文件
        const projectRoot = getProjectRoot();
        const envPath = join(projectRoot, '.env');
        fs.writeFileSync(envPath, envContent, 'utf8');
        
        res.json({ 
          success: true, 
          message: 'Installation completed! Server will restart.',
          serverUrl: site.serverUrl || 'http://localhost:3002'
        });
        
        // 确保响应已发送后再关闭服务器
        res.on('finish', async () => {
          try {
            console.log('[ReactPress] Installation complete, restarting server...');
            await safelyCloseServer();
            await startMainApplication();
          } catch (error) {
            console.error('[ReactPress] Restart error:', error);
          }
        });
        
      } catch (error: any) {
        res.status(400).json({ 
          success: false, 
          message: `Installation failed: ${error.message}` 
        });
      }
    });
    
    // 使用状态跟踪启动服务器
    await startServerWithState(app, port);
    
    try {
      await open(`http://localhost:${port}`);
    } catch (error) {
      console.log(`[ReactPress] Please visit http://localhost:${port} manually`);
    }
    
  } catch (error) {
    console.error('[ReactPress] Installation wizard failed:', error);
    // 确保服务器被正确关闭
    await safelyCloseServer();
    throw error;
  }
};

// 启动主应用
const startMainApplication = async (): Promise<void> => {
  try {
    console.log('[ReactPress] Starting main application...');
    
    // 确保安装服务器完全关闭
    await safelyCloseServer();
    
    // 清除安装状态
    global.isInstalling = false;
    
    // 延迟启动以确保端口释放
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 动态导入以避免在安装阶段加载 NestJS
    const { bootstrap } = await import('./starter');
    if (typeof bootstrap === 'function') {
      await bootstrap();
    } else {
      throw new Error('Bootstrap function not found');
    }
  } catch (error) {
    console.error('[ReactPress] Failed to start main application:', error);
    process.exit(1);
  }
};

main();