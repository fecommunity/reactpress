import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';

import { WebhookService } from '../webhook/webhook.service';
import { Article } from './article.entity';

@Injectable()
export class ScheduledPublishService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly webhookService: WebhookService
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => this.tick().catch((e) => console.error('[ScheduledPublish]', e)), 60_000);
    this.tick().catch(() => {});
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async tick() {
    const now = new Date();
    const due = await this.articleRepository.find({
      where: {
        status: 'draft',
        scheduledPublishAt: LessThanOrEqual(now),
      },
    });

    for (const article of due) {
      article.status = 'publish';
      article.publishAt = new Date();
      article.scheduledPublishAt = null;
      const saved = await this.articleRepository.save(article);
      await this.webhookService.dispatch('article.published', {
        id: saved.id,
        title: saved.title,
        status: saved.status,
        publishAt: saved.publishAt,
        scheduled: true,
      });
    }
  }
}
