import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { createConnection } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InstallService {
  private envConfigPath = path.resolve(__dirname, '..', '..', '.env');
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  checkEnvFileExists(): boolean {
    return fs.existsSync(this.envConfigPath);
  }

  async configureDatabase(config: { username: string, password: string, database: string }): Promise<void> {
    const connection = await createConnection({
      type: 'mysql',
      host: 'localhost', // 这里可以改为从body中获取，但为了简化我们固定为localhost
      port: 3306,        // 同样，可以改为动态获取
      username: config.username,
      password: config.password,
      database: config.database,
      synchronize: true, // 注意：在生产中不要启用synchronize
      logging: false,    // 控制台不输出orm日志
      entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 扫描实体位置
    });

    try {
      await connection.connect();
      console.log('Connected to the database');

      // 写入.env文件
      const envConfigLines = [
        `DB_HOST=localhost`, // 也可以动态写入
        `DB_PORT=3306`,      // 同上
        `DB_USERNAME=${config.username}`,
        `DB_PASSWORD=${config.password}`,
        `DB_NAME=${config.database}`,
      ];

      fs.writeFileSync(this.envConfigPath, envConfigLines.join('\n'), { encoding: 'utf8' });
    } catch (error) {
      throw new Error('Failed to connect to the database: ' + error.message);
    } finally {
      await connection.close();
    }
  }
}