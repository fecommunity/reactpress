import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import * as http from 'http';
import * as net from 'net';
import { existsSync } from 'fs';
import { join } from 'path';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

import { AppModule } from './app.module';
import { ApiMsg } from './common/api-messages';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { resolveProjectRoot } from './utils/project-root.util';
import { isLocalApiQuiet } from './utils/local-api-quiet.util';

let nestApp: INestApplication | null = null;

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function normalizeHealthPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as Record<string, unknown>;
  const nested = body.data;
  if (nested && typeof nested === 'object' && ('status' in (nested as object) || 'database' in (nested as object))) {
    return nested as Record<string, unknown>;
  }
  return body;
}

function isHealthPayloadReady(payload: Record<string, unknown> | null): boolean {
  if (!payload) return false;
  if (Object.prototype.hasOwnProperty.call(payload, 'database')) {
    return payload.status === 'ok' && payload.database === 'up';
  }
  return payload.status === 'ok' || payload.status === 'OK';
}

function probeApiHealth(port: number, prefix = '/api'): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: `${prefix.replace(/\/$/, '')}/health`,
        method: 'GET',
        timeout: 2000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => {
          body += c;
        });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            resolve(false);
            return;
          }
          try {
            const payload = normalizeHealthPayload(JSON.parse(body));
            resolve(isHealthPayloadReady(payload));
          } catch {
            resolve(false);
          }
        });
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

export async function bootstrap() {
  resolveProjectRoot();
  const configuredPort = Number(process.env.SERVER_PORT || 3002);
  const apiPrefix = String(process.env.SERVER_API_PREFIX || '/api');

  if (
    process.env.REACTPRESS_API_ENTRY === 'starter' &&
    (await isPortOpen(configuredPort)) &&
    (await probeApiHealth(configuredPort, apiPrefix))
  ) {
    console.log(`[ReactPress] API already healthy on :${configuredPort} (nest watch reload — skip bootstrap)`);
    return null;
  }

  try {
    if (nestApp) {
      await nestApp.close();
      nestApp = null;
    }

    const app = await NestFactory.create(AppModule, {
      logger: isLocalApiQuiet() ? ['error', 'warn'] : undefined,
    });
    const configService = app.get('ConfigService');
    const listenPort = Number(configService.get('SERVER_PORT', configuredPort));

    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const { shouldRedirectDevPortToNginx, buildDevPortRedirectUrl } = require('@fecommunity/reactpress-toolkit/plugin/dev');
      if (
        !        shouldRedirectDevPortToNginx({
          host: req.headers.host,
          method: req.method,
          accept: req.headers.accept,
          directPort: listenPort,
          pathname: req.path,
          skipPathPrefixes: ['/public'],
        })
      ) {
        next();
        return;
      }
      res.redirect(
        302,
        buildDevPortRedirectUrl({
          directPort: listenPort,
          pathname: req.path,
          search: req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '',
        })
      );
    });

    app.enableCors();
    const apiPrefix = String(configService.get('SERVER_API_PREFIX', '/api')).replace(/\/$/, '');
    app.setGlobalPrefix(apiPrefix);

    app.use(
      rateLimit({
        windowMs: 60 * 1000,
        max: 10000,
      })
    );

    app.use(
      `${apiPrefix}/auth/login`,
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        skipSuccessfulRequests: true,
        standardHeaders: true,
        legacyHeaders: false,
        handler(_req, res) {
          res.status(429).json({
            statusCode: 429,
            msg: ApiMsg.TOO_MANY_LOGIN_ATTEMPTS,
            success: false,
            data: null,
          });
        },
      })
    );

    const rootDir = join(__dirname, '../public');
    const uploadDir = process.env.REACTPRESS_UPLOAD_DIR?.trim();
    if (uploadDir && existsSync(uploadDir)) {
      app.use('/public/uploads', express.static(uploadDir));
    }
    app.use('/public', express.static(rootDir));

    for (const name of ['logo.png', 'favicon.png', 'favicon.ico'] as const) {
      const filePath = join(rootDir, name);
      if (existsSync(filePath)) {
        app.use(`/${name}`, (_req: express.Request, res: express.Response) => {
          res.sendFile(filePath);
        });
      }
    }

    app.use(compression());
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
      })
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

    // 增强版 Swagger 配置
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ReactPress API Documentation')
      .setDescription(
        'Comprehensive API documentation for ReactPress - A modern content management system built with NestJS'
      )
      .setVersion('3.0')
      .setContact('ReactPress Team', 'https://github.com/fecommunity/reactpress', 'admin@gaoredu.com')
      .setLicense('MIT', 'https://github.com/fecommunity/reactpress/blob/main/LICENSE')
      .addServer(configService.get('SERVER_SITE_URL', 'http://localhost:3002'), 'API Server')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // 使用 swagger-themes 提供专业主题
    const theme = new SwaggerTheme();

    // 自定义 Swagger 设置
    const options = {
      customCss: theme.getBuffer(SwaggerThemeNameEnum.MATERIAL), // 应用主题
      customSiteTitle: 'ReactPress API Documentation',
      customfavIcon: '/public/favicon.ico',
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
        persistAuthorization: true, // 保持授权数据
        displayOperationId: true,
        operationsSorter: 'method', // 按方法排序
        tagsSorter: 'alpha', // 按字母顺序排序标签
      },
      customCssUrl: '/public/swagger/custom.css', // 额外的自定义CSS
    };

    // 设置 Swagger UI
    SwaggerModule.setup('api', app, document, options);

    const listenPrefix = String(configService.get('SERVER_API_PREFIX', apiPrefix));

    if (
      process.env.REACTPRESS_API_ENTRY === 'starter' &&
      (await isPortOpen(listenPort)) &&
      (await probeApiHealth(listenPort, listenPrefix))
    ) {
      console.log(`[ReactPress] API already healthy on :${listenPort} (nest watch reload — skip duplicate listen)`);
      await app.close();
      return null;
    }

    await app.listen(listenPort);
    nestApp = app;
    if (isLocalApiQuiet()) {
      const dbType = String(configService.get('DB_TYPE') || 'mysql').toLowerCase();
      console.log(
        `[ReactPress] Local API ready · ${dbType === 'sqlite' ? 'SQLite' : dbType} · http://127.0.0.1:${listenPort}${listenPrefix}/health`,
      );
    } else {
      console.log(`[ReactPress] Application started on http://localhost:${listenPort}`);
      console.log(`[ReactPress] API Documentation available at http://localhost:${listenPort}/api`);
    }

    return app;
  } catch (error) {
    console.error('[ReactPress] Failed to start application:', error);

    if (error.code === 'EADDRINUSE') {
      const port = Number(process.env.SERVER_PORT || 3002);
      const prefix = process.env.SERVER_API_PREFIX || '/api';
      if (process.env.REACTPRESS_API_ENTRY === 'starter' && (await probeApiHealth(port, prefix))) {
        console.log(`[ReactPress] Port :${port} in use but API healthy — treating watch reload as success`);
        return null;
      }
      console.error('[ReactPress] Port is already in use. Please check for other running instances.');
      console.error('[ReactPress] You can change the port in your .env file or terminate the conflicting process.');
    }

    throw error;
  }
}

async function shutdownNest(signal: string) {
  console.log(`\n[ReactPress] Received ${signal}, shutting down…`);
  if (nestApp) {
    try {
      await nestApp.close();
    } catch {
      // ignore
    }
    nestApp = null;
  }
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdownNest('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdownNest('SIGTERM');
});

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('[ReactPress] Failed to start:', err);
    process.exit(1);
  });
}
