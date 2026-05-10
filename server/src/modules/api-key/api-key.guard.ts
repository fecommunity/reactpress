import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rawKey =
      request.headers['x-api-key'] ||
      (request.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();

    if (!rawKey) {
      throw new UnauthorizedException('缺少 API Key');
    }

    const apiKey = await this.apiKeyService.validateRawKey(rawKey);
    if (!apiKey) {
      throw new UnauthorizedException('无效的 API Key');
    }

    request.apiKey = apiKey;
    return true;
  }
}
