import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';

import { Webhook } from './webhook.entity';

export type WebhookEvent = 'article.published' | 'comment.created';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhookRepository: Repository<Webhook>
  ) {}

  async create(data: Partial<Webhook> & { secret?: string }) {
    const secret = data.secret || crypto.randomBytes(16).toString('hex');
    const entity = this.webhookRepository.create({ ...data, secret });
    return this.webhookRepository.save(entity);
  }

  findAll() {
    return this.webhookRepository.find({ order: { createAt: 'DESC' } });
  }

  async remove(id: string) {
    const hook = await this.webhookRepository.findOne(id);
    if (!hook) {
      throw new HttpException('Webhook 不存在', HttpStatus.NOT_FOUND);
    }
    return this.webhookRepository.remove(hook);
  }

  private signPayload(secret: string, body: string) {
    return crypto.createHmac('sha256', secret).update(body).digest('hex');
  }

  private async deliverOnce(webhook: Webhook, event: WebhookEvent, payload: Record<string, unknown>) {
    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });
    const signature = this.signPayload(webhook.secret, body);
    await axios.post(webhook.url, body, {
      headers: {
        'Content-Type': 'application/json',
        'X-ReactPress-Event': event,
        'X-ReactPress-Signature': `sha256=${signature}`,
      },
      timeout: 10000,
    });
  }

  private async deliverWithRetry(webhook: Webhook, event: WebhookEvent, payload: Record<string, unknown>) {
    const delays = [0, 2000, 5000];
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (delays[attempt] > 0) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
      try {
        await this.deliverOnce(webhook, event, payload);
        return;
      } catch (err) {
        lastError = err;
      }
    }
    console.error(`[Webhook] 投递失败 ${webhook.url} (${event}):`, lastError?.message || lastError);
  }

  async dispatch(event: WebhookEvent, payload: Record<string, unknown>) {
    const hooks = await this.webhookRepository
      .createQueryBuilder('webhook')
      .addSelect('webhook.secret')
      .where('webhook.enabled = :enabled', { enabled: true })
      .getMany();

    const targets = hooks.filter((h) =>
      h.events
        .split(',')
        .map((e) => e.trim())
        .includes(event)
    );

    await Promise.all(targets.map((hook) => this.deliverWithRetry(hook, event, payload)));
  }
}
