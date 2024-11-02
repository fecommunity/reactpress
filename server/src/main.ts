import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { join } from 'path';
import * as open from 'open';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get('ConfigService');

  app.enableCors(); // 开启跨域
  app.setGlobalPrefix(configService.get('SERVER_API_PREFIX', '/api'));
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minutes
      max: 10000, // limit each IP to 1000 requests per windowMs
    })
  );

  // 配置 public 文件夹为静态目录，以达到可直接访问下面文件的目的
  const rootDir = join(__dirname, '../public');
  app.use('/public', express.static(rootDir));

  app.use(compression()); // 启用 gzip 压缩
  app.use(helmet()); // 使用 helmet 中间件来增加安全性的 HTTP 头部，防止一些常见的 Web 安全漏洞
  app.useGlobalInterceptors(new TransformInterceptor()); // 正常情况下，响应值统一
  app.useGlobalFilters(new HttpExceptionFilter()); // 异常情况下，响应值统一
  app.use(bodyParser.json({ limit: '10mb' })); // 修改请求的容量
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ReactPress Open Api')
    .setDescription('ReactPress Open Api Document')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('SERVER_PORT', 3002));
  await open(`http://localhost:${configService.get('CLIENT_PORT', 3001)}`)
  console.log(`[ReactPress] 服务启动成功`);
}

bootstrap();
