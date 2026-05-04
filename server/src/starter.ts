import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { join } from 'path';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

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
    
    // 增强版 Swagger 配置
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ReactPress API Documentation')
      .setDescription('Comprehensive API documentation for ReactPress - A modern content management system built with NestJS')
      .setVersion('2.0')
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
      customfavIcon: '/public/favicon.png',
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

    const configuredPort = configService.get('SERVER_PORT', 3002);
    
    await app.listen(configuredPort);
    console.log(`[ReactPress] Application started on http://localhost:${configuredPort}`);
    console.log(`[ReactPress] API Documentation available at http://localhost:${configuredPort}/api`);
    
    return app;
    
  } catch (error) {
    console.error('[ReactPress] Failed to start application:', error);
    
    if (error.code === 'EADDRINUSE') {
      console.error('[ReactPress] Port is already in use. Please check for other running instances.');
      console.error('[ReactPress] You can change the port in your .env file or terminate the conflicting process.');
    }
    
    throw error;
  }
}

process.on('SIGINT', () => {
  console.log('\n[ReactPress] Application shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[ReactPress] Application shutting down gracefully...');
  process.exit(0);
});