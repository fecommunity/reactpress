import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

// 端口检测函数
const checkPortAvailability = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const net = require('net');
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.once('close', () => resolve(true)).close())
      .listen(port);
  });
};

// 查找可用端口
const findAvailableApplicationPort = async (startPort: number, maxAttempts = 10): Promise<number> => {
  for (let i = 0; i < maxAttempts; i++) {
    const portToTry = startPort + i;
    if (await checkPortAvailability(portToTry)) {
      return portToTry;
    }
  }
  throw new Error(`No available ports found in range ${startPort}-${startPort + maxAttempts - 1}`);
};

// 等待端口可用
const waitForPort = async (port: number, timeout = 30000): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await checkPortAvailability(port)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return false;
};

export async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get('ConfigService');

    app.enableCors();
    app.setGlobalPrefix(configService.get('SERVER_API_PREFIX', '/api'));
    
    app.use(
      rateLimit({
        windowMs: 60 * 1000,
        max: 10000,
      })
    );

    const rootDir = join(__dirname, '../public');
    app.use('/public', express.static(rootDir));

    app.use(compression());
    app.use(helmet());
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ReactPress Open Api')
      .setDescription('ReactPress Open Api Document')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    const configuredPort = configService.get('SERVER_PORT', 3002);
    
    // 确保端口可用
    const isPortAvailable = await checkPortAvailability(configuredPort);
    if (!isPortAvailable) {
      console.warn(`[ReactPress] Port ${configuredPort} is not available, waiting for it to be released...`);
      const portReleased = await waitForPort(configuredPort);
      
      if (!portReleased) {
        console.error(`[ReactPress] Port ${configuredPort} is still occupied after waiting`);
        process.exit(1);
      }
    }
    
    await app.listen(configuredPort);
    console.log(`[ReactPress] Application started on http://localhost:${configuredPort}`);
    console.log(`[ReactPress] Please visit http://localhost:${configuredPort}/api manually`);
    
    return app;
    
  } catch (error) {
    console.error('[ReactPress] Failed to start application:', error);
    
    // 提供友好的错误信息
    if (error.code === 'EADDRINUSE') {
      console.error('[ReactPress] Port is already in use. Please check for other running instances.');
      console.error('[ReactPress] You can change the port in your .env file or terminate the conflicting process.');
    }
    
    throw error;
  }
}

// 添加进程信号处理
process.on('SIGINT', () => {
  console.log('\n[ReactPress] Application shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[ReactPress] Application shutting down gracefully...');
  process.exit(0);
});