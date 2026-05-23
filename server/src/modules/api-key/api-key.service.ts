import { ApiMsg } from '../../common/api-messages';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';

import { ApiKey } from './api-key.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>
  ) {}

  private generateRawKey() {
    return `rp_${crypto.randomBytes(24).toString('hex')}`;
  }

  async create(name: string, scopes = 'read'): Promise<{ apiKey: ApiKey; rawKey: string }> {
    const rawKey = this.generateRawKey();
    const keyHash = await bcrypt.hash(rawKey, 10);
    const keyPrefix = rawKey.slice(0, 10);
    const entity = this.apiKeyRepository.create({ name, keyHash, keyPrefix, scopes, enabled: true });
    const saved = await this.apiKeyRepository.save(entity);
    return { apiKey: saved, rawKey };
  }

  async findAll(): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({ order: { createAt: 'DESC' } });
  }

  async revoke(id: string) {
    const key = await this.apiKeyRepository.findOne(id);
    if (!key) {
      throw new HttpException(ApiMsg.API_KEY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    key.enabled = false;
    return this.apiKeyRepository.save(key);
  }

  async validateRawKey(rawKey: string): Promise<ApiKey | null> {
    if (!rawKey || !rawKey.startsWith('rp_')) {
      return null;
    }
    const prefix = rawKey.slice(0, 10);
    const candidates = await this.apiKeyRepository
      .createQueryBuilder('api_key')
      .addSelect('api_key.keyHash')
      .where('api_key.enabled = :enabled', { enabled: true })
      .andWhere('api_key.keyPrefix = :prefix', { prefix })
      .getMany();

    for (const candidate of candidates) {
      const match = await bcrypt.compare(rawKey, candidate.keyHash);
      if (match) {
        candidate.lastUsedAt = new Date();
        await this.apiKeyRepository.update(candidate.id, { lastUsedAt: candidate.lastUsedAt });
        return candidate;
      }
    }
    return null;
  }

  hasScope(apiKey: ApiKey, scope: string) {
    const scopes = (apiKey.scopes || 'read').split(',').map((s) => s.trim());
    return scopes.includes(scope) || scopes.includes('*');
  }
}
