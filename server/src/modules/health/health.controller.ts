import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    let database: 'up' | 'down' = 'down';
    try {
      if (this.connection.isConnected) {
        await this.connection.query('SELECT 1');
        database = 'up';
      }
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'degraded',
      version: '3.0.0',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
