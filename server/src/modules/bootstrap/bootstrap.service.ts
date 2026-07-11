import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { marked } from '../../utils/markdown.util';
import { ArticleService } from '../article/article.service';
import { Article } from '../article/article.entity';
import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';
import {
  getHelloWorldSeed,
  HELLO_WORLD_LEGACY_TITLES,
  HELLO_WORLD_SEED_MARKER,
} from './bootstrap.constants';
import { InstallLocale, resolveInstallLocale } from './install-locale';

function extractSummary(markdown: string): string {
  const plain = markdown
    .replace(/^<!--.*-->$/gm, '')
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+.*/gm, '')
    .replace(/^---$/gm, '')
    .trim()
    .split('\n\n')
    .find((block) => block.trim() && !block.startsWith('```')) ?? '';

  const line = plain.replace(/\n/g, ' ').trim();
  if (!line) return '';
  return line.length > 160 ? `${line.slice(0, 157)}...` : line;
}

function needsTocRepair(toc: string | null | undefined): boolean {
  if (!toc?.trim()) return true;
  try {
    const parsed = JSON.parse(toc) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return true;
    const first = parsed[0];
    return Array.isArray(first) || !(first && typeof first === 'object' && 'id' in first);
  } catch {
    return true;
  }
}

function needsContentRefresh(content: string | null | undefined, locale: InstallLocale): boolean {
  if (!content?.trim()) return true;
  const marker = `<!-- ${HELLO_WORLD_SEED_MARKER}:${locale} -->`;
  if (content.includes(marker)) return false;
  return (
    content.includes('## English') ||
    content.includes('## 中文') ||
    content.includes('Hello World / 欢迎使用') ||
    content.includes('reactpress-seed:')
  );
}

const HELLO_WORLD_COVER = '/logo.png';

/** 示例文章写入首页推荐，并补齐封面以便轮播展示。 */
function ensureHelloWorldHomeRecommend(article: Article): boolean {
  let changed = false;

  if (!article.isRecommended) {
    article.isRecommended = true;
    changed = true;
  }

  if (!article.cover?.trim()) {
    article.cover = HELLO_WORLD_COVER;
    changed = true;
  }

  return changed;
}

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly articleService: ArticleService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    void this.runFirstRunBootstrap();
  }

  private resolveLocale(): InstallLocale {
    return resolveInstallLocale(
      this.configService.get('REACTPRESS_LANG') || this.configService.get('LANG'),
    );
  }

  private async runFirstRunBootstrap() {
    try {
      await this.seedHelloWorldArticle();
    } catch (error) {
      this.logger.error('First-run bootstrap failed', error instanceof Error ? error.stack : String(error));
    }
  }

  /** 创建或升级 Hello World 示例文章（语言与安装时一致）。 */
  async seedHelloWorldArticle(): Promise<void> {
    const locale = this.resolveLocale();
    const seed = getHelloWorldSeed(locale);
    const { html, toc } = marked(seed.markdown);
    const summary = extractSummary(seed.markdown);

    const existing = await this.articleRepository.findOne({
      where: { title: In([...HELLO_WORLD_LEGACY_TITLES, seed.articleTitle]) },
    });

    if (existing) {
      const refreshContent = needsContentRefresh(existing.content, locale);
      const refreshToc = needsTocRepair(existing.toc);
      const refreshRecommend = ensureHelloWorldHomeRecommend(existing);
      if (!refreshContent && !refreshToc && !refreshRecommend) return;

      if (refreshContent) {
        existing.title = seed.articleTitle;
        existing.content = seed.markdown;
        existing.summary = summary;
      }
      if (refreshContent || refreshToc) {
        existing.html = html;
        existing.toc = toc;
      }
      await this.articleRepository.save(existing);
      this.logger.log(`Hello World sample article updated (${locale})`);
      return;
    }

    if ((await this.articleRepository.count()) > 0) return;

    const category = await this.findOrCreateCategory(seed.category);
    const tags = await Promise.all(seed.tags.map((tag) => this.findOrCreateTag(tag)));

    await this.articleService.create({
      title: seed.articleTitle,
      content: seed.markdown,
      html,
      toc,
      summary,
      status: 'publish',
      cover: HELLO_WORLD_COVER,
      category: category.id,
      tags: tags.map((tag) => tag.id).join(','),
      isRecommended: true,
      isCommentable: true,
    } as unknown as Partial<Article>);

    this.logger.log(`Hello World sample article seeded (${locale})`);
  }

  private async findOrCreateCategory(def: { label: string; value: string }): Promise<Category> {
    let category =
      (await this.categoryRepository.findOne({ where: { value: def.value } })) ??
      (await this.categoryRepository.findOne({ where: { label: def.label } }));

    if (category) return category;

    category = this.categoryRepository.create(def);
    return this.categoryRepository.save(category);
  }

  private async findOrCreateTag(def: { label: string; value: string }): Promise<Tag> {
    let tag =
      (await this.tagRepository.findOne({ where: { value: def.value } })) ??
      (await this.tagRepository.findOne({ where: { label: def.label } }));

    if (tag) return tag;

    tag = this.tagRepository.create(def);
    return this.tagRepository.save(tag);
  }
}
