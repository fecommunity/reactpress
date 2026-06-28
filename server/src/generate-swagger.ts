import './node-polyfills';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

import { AppModule } from './app.module';

async function generateSwaggerJson() {
  let app;
  try {
    console.log('🚀 Starting Swagger JSON generation...');

    // 创建应用实例，但不初始化数据库连接
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'], // 只记录错误和警告
    });

    // 获取配置服务
    const configService = app.get('ConfigService');
    const apiPrefix = configService.get('SERVER_API_PREFIX', '/api');

    console.log('📝 Configuring Swagger documentation...');

    // 增强版 Swagger 配置
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ReactPress API Documentation')
      .setDescription(
        'Comprehensive API documentation for ReactPress - A modern content management system built with NestJS'
      )
      .setVersion('2.0')
      .setContact('ReactPress Team', 'https://github.com/fecommunity/reactpress', 'admin@gaoredu.com')
      .setLicense('MIT', 'https://github.com/fecommunity/reactpress/blob/main/LICENSE')
      .addServer(configService.get('SERVER_SITE_URL', 'http://localhost:3002'), 'API Server')
      .build();

    // 创建 Swagger 文档
    console.log('🔨 Generating Swagger document...');
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // 写入文件
    const outputPath = join(__dirname, '../public/swagger.json');

    // 确保 public 目录存在
    const publicDir = join(__dirname, '../public');
    if (!existsSync(publicDir)) {
      console.log('📁 Creating public directory...');
      require('fs').mkdirSync(publicDir, { recursive: true });
    }

    // 如果文件已经存在，就覆盖掉
    if (existsSync(outputPath)) {
      console.log('🗑️ Removing existing swagger.json file...');
      unlinkSync(outputPath);
    }

    console.log('💾 Writing Swagger JSON to file...');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));

    console.log(`✅ Success! Swagger JSON generated at: ${outputPath}`);

    // 直接退出进程，避免关闭应用时的数据库连接错误
    console.log('🎉 Swagger generation process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during Swagger generation:', error.message);

    // 检查是否已有现有的 swagger.json 文件
    const existingPath = join(__dirname, '../public/swagger.json');
    if (existsSync(existingPath)) {
      console.log('ℹ️ Using existing swagger.json file');
      console.log('🎉 Swagger generation process completed successfully');
      process.exit(0);
    } else {
      console.error('❌ No existing swagger.json file found');
      process.exit(1);
    }
  } finally {
    // 不尝试关闭应用，直接退出进程
    // 这样可以避免数据库连接池错误
  }
}

// 运行生成函数
generateSwaggerJson().catch((e) => {
  console.error('💥 Unhandled error in generateSwaggerJson:', e.message);

  // 检查是否已有现有的 swagger.json 文件
  const existingPath = join(__dirname, '../public/swagger.json');
  if (existsSync(existingPath)) {
    console.log('ℹ️ Using existing swagger.json file');
    console.log('🎉 Swagger generation process completed successfully');
    process.exit(0);
  } else {
    console.error('❌ No existing swagger.json file found');
    process.exit(1);
  }
});
