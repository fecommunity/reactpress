import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApiMsg } from '../../common/api-messages';
import { dateFormat } from '../../utils/date.util';
import { filterByWhitelist } from '../../utils/query-whitelist.util';
import { CategoryService } from '../category/category.service';
import { HookService } from '../hook/hook.service';
import { TagService } from '../tag/tag.service';
import { WebhookService } from '../webhook/webhook.service';
import { Article } from './article.entity';
import { ArticleRevision } from './article-revision.entity';
import { normalizeArticleSlug } from './article-slug.util';
import { extractProtectedArticle } from './article.util';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Segment = require('segment');
const segment = new Segment();
segment.useDefault();

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleRevision)
    private readonly revisionRepository: Repository<ArticleRevision>,
    private readonly tagService: TagService,
    private readonly categoryService: CategoryService,
    private readonly webhookService: WebhookService,
    private readonly hookService: HookService,
  ) {}

  private async saveRevision(article: Article) {
    const revision = this.revisionRepository.create({
      articleId: article.id,
      article,
      title: article.title,
      content: article.content,
      html: article.html,
      status: article.status,
    });
    await this.revisionRepository.save(revision);
  }

  private async notifyPublished(article: Article, extra: Record<string, unknown> = {}) {
    if (article.status !== 'publish') return;
    await this.webhookService.dispatch('article.published', {
      id: article.id,
      title: article.title,
      status: article.status,
      publishAt: article.publishAt,
      ...extra,
    });
  }

  private async applyPublishFilters(article: Partial<Article>): Promise<Partial<Article>> {
    return this.hookService.applyFilters('article.beforePublish', { ...article });
  }

  private normalizeSeoPayload(payload: Partial<Article>): Partial<Article> {
    const next = { ...payload };
    if ('slug' in next) {
      next.slug = normalizeArticleSlug(next.slug);
    }
    if (typeof next.seoKeywords === 'string') {
      next.seoKeywords = next.seoKeywords.trim() || null;
    }
    if (typeof next.seoDescription === 'string') {
      next.seoDescription = next.seoDescription.trim() || null;
    }
    return next;
  }

  private applyPublishFilterPatch(
    patch: Partial<Article>,
    filtered: Partial<Article>,
  ): Partial<Article> {
    const next = { ...patch };
    for (const key of ['summary', 'slug', 'seoKeywords', 'seoDescription'] as const) {
      if (filtered[key] !== undefined && filtered[key] !== null) {
        next[key] = filtered[key] as never;
      }
    }
    return next;
  }

  private async assertSlugAvailable(slug: string | null | undefined, excludeId?: string): Promise<void> {
    if (!slug) return;
    const query = this.articleRepository
      .createQueryBuilder('article')
      .where('article.slug = :slug', { slug })
      .take(1);
    if (excludeId) {
      query.andWhere('article.id != :excludeId', { excludeId });
    }
    const exist = await query.getOne();
    if (exist) {
      throw new HttpException(ApiMsg.ARTICLE_SLUG_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 创建文章
   * @param article
   */
  async create(article: Partial<Article>): Promise<Article> {
    let payload = this.normalizeSeoPayload(
      await this.hookService.applyFilters('article.beforeCreate', { ...article }),
    );
    const { title } = payload;
    const exist = await this.articleRepository.findOne({ where: { title } });

    if (exist) {
      throw new HttpException(ApiMsg.ARTICLE_TITLE_EXISTS, HttpStatus.BAD_REQUEST);
    }

    await this.assertSlugAvailable(payload.slug);

    let { tags, category, status } = payload; // eslint-disable-line prefer-const

    if (status === 'publish') {
      payload = this.normalizeSeoPayload(await this.applyPublishFilters(payload));
      await this.assertSlugAvailable(payload.slug);
      Object.assign(payload, {
        publishAt: dateFormat(),
      });
    }

    tags = await this.tagService.findByIds(('' + tags).split(','));
    const existCategory = await this.categoryService.findById(category);
    const newArticle = await this.articleRepository.create({
      ...payload,
      category: existCategory,
      tags,
      needPassword: !!payload.password,
    });
    await this.articleRepository.save(newArticle);
    if (newArticle.status === 'publish') {
      await this.hookService.doAction('article.afterPublish', {
        article: newArticle,
        isNew: true,
      });
    }
    await this.notifyPublished(newArticle);
    return newArticle;
  }

  /**
   * 获取所有文章
   */
  async findAll(queryParams): Promise<[Article[], number]> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tag')
      .leftJoinAndSelect('article.category', 'category')
      .orderBy('article.publishAt', 'DESC');

    const { page = 1, pageSize = 12, status, ...otherParams } = queryParams;

    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);

    if (status) {
      query.andWhere('article.status=:status').setParameter('status', status);
    }

    const filtered = filterByWhitelist('article', queryParams);
    Object.keys(filtered).forEach((key) => {
      query.andWhere(`article.${key} LIKE :${key}`).setParameter(`${key}`, `%${filtered[key]}%`);
    });

    const [data, total] = await query.getManyAndCount();

    data.forEach((d) => {
      if (d.needPassword) {
        extractProtectedArticle(d);
      }
    });

    return [data, total];
  }

  /**
   * 根据 category 查找文章
   * @param category
   * @param queryParams
   */
  async findArticlesByCategory(category, queryParams) {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .where('category.value=:value', { value: category })
      .orderBy('article.publishAt', 'DESC');

    const { page = 1, pageSize = 12, status } = queryParams;
    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);

    if (status) {
      query.andWhere('article.status=:status').setParameter('status', status);
    }

    const [data, total] = await query.getManyAndCount();

    data.forEach((d) => {
      if (d.needPassword) {
        extractProtectedArticle(d);
      }
    });

    return [data, total];
  }

  /**
   * 根据 tag 查找文章
   * @param tag
   * @param queryParams
   */
  async findArticlesByTag(tag, queryParams) {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .innerJoinAndSelect('article.tags', 'tag', 'tag.value=:value', {
        value: tag,
      })
      .orderBy('article.publishAt', 'DESC');

    const { page = 1, pageSize = 12, status } = queryParams;
    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);

    if (status) {
      query.andWhere('article.status=:status').setParameter('status', status);
    }

    const [data, total] = await query.getManyAndCount();

    data.forEach((d) => {
      if (d.needPassword) {
        extractProtectedArticle(d);
      }
    });

    return [data, total];
  }

  /**
   * 获取推荐文章
   */
  async getRecommendArticles() {
    const data = await this.articleRepository.find({
      where: { isRecommended: true },
      order: { publishAt: 'DESC' },
    });

    return data.filter((d) => !d.needPassword);
  }

  /**
   * 获取文章归档
   */
  async getArchives(): Promise<{ [key: string]: Article[] }> {
    const data = await this.articleRepository.find({
      where: { status: 'publish' },
      order: { publishAt: 'DESC' },
    });
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const ret = {};
    data.forEach((d) => {
      const year = new Date(d.publishAt).getFullYear();
      const month = new Date(d.publishAt).getMonth();
      if (d.needPassword) {
        extractProtectedArticle(d);
      }
      if (!ret[year]) {
        ret[year] = {};
      }
      if (!ret[year][months[month]]) {
        ret[year][months[month]] = [];
      }
      ret[year][months[month]].push(d);
    });

    return ret;
  }

  /**
   * 校验文章密码是否正确
   * @param id
   * @param password
   */
  async checkPassword(id, { password }): Promise<{ pass: boolean }> {
    const data = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.id=:id')
      .andWhere('article.password=:password')
      .setParameter('id', id)
      .setParameter('password', password)
      .getOne();

    const pass = !!data;
    return pass ? { pass: !!data, ...data } : { pass: false };
  }

  /**
   * 获取指定文章信息
   * @param id
   */
  async findById(id, status = null, isAdmin = false): Promise<Article> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.id=:id')
      .orWhere('article.title=:title')
      .orWhere('article.slug=:slug')
      .setParameter('id', id)
      .setParameter('title', id)
      .setParameter('slug', id);

    if (status) {
      query.andWhere('article.status=:status').setParameter('status', status);
    }

    const data = await query.getOne();

    if (data && data.needPassword && !isAdmin) {
      extractProtectedArticle(data);
    }

    return data;
  }

  /**
   * 更新指定文章
   * @param id
   * @param article
   */
  async updateById(id, article: Partial<Article>): Promise<Article> {
    const oldArticle = await this.articleRepository.findOne(id);
    await this.saveRevision(oldArticle);
    let { tags, category, status } = article; // eslint-disable-line prefer-const

    let patch: Partial<Article> = this.normalizeSeoPayload({
      ...article,
      views: oldArticle.views,
      needPassword: !!article.password,
    });

    await this.assertSlugAvailable(patch.slug, id);

    if (tags) {
      tags = await this.tagService.findByIds(('' + tags).split(','));
    }

    const existCategory = await this.categoryService.findById(category);

    const becomingPublish = oldArticle.status === 'draft' && status === 'publish';
    patch = {
      ...patch,
      category: existCategory,
      publishAt: becomingPublish ? (dateFormat() as unknown as Date) : oldArticle.publishAt,
      scheduledPublishAt: status === 'publish' ? null : article.scheduledPublishAt ?? oldArticle.scheduledPublishAt,
    };

    if (tags) {
      Object.assign(patch, { tags });
    }

    if (status === 'publish' || becomingPublish) {
      const filtered = this.normalizeSeoPayload(
        await this.applyPublishFilters({
          ...oldArticle,
          ...patch,
        }),
      );
      patch = this.applyPublishFilterPatch(patch, filtered);
      await this.assertSlugAvailable(patch.slug, id);
      patch.publishAt = becomingPublish ? (dateFormat() as unknown as Date) : oldArticle.publishAt;
    }

    const updatedArticle = await this.articleRepository.merge(oldArticle, patch);
    const saved = await this.articleRepository.save(updatedArticle);
    if (becomingPublish) {
      await this.hookService.doAction('article.afterPublish', {
        article: saved,
        isNew: false,
      });
      await this.notifyPublished(saved);
    }
    return saved;
  }

  async listRevisions(articleId: string) {
    return this.revisionRepository.find({
      where: { articleId },
      order: { createAt: 'DESC' },
      take: 50,
    });
  }

  async restoreRevision(articleId: string, revisionId: string) {
    const revision = await this.revisionRepository.findOne(revisionId);
    if (!revision || revision.articleId !== articleId) {
      throw new HttpException(ApiMsg.REVISION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const article = await this.articleRepository.findOne(articleId);
    await this.saveRevision(article);
    const restored = await this.articleRepository.merge(article, {
      title: revision.title,
      content: revision.content,
      html: revision.html,
      status: revision.status,
    });
    return this.articleRepository.save(restored);
  }

  /**
   * 更新指定文章阅读量 + 1
   * @param id
   * @param article
   */
  async updateViewsById(id): Promise<Article> {
    const oldArticle = await this.articleRepository.findOne(id);
    const updatedArticle = await this.articleRepository.merge(oldArticle, {
      views: oldArticle.views + 1,
    });
    return this.articleRepository.save(updatedArticle);
  }

  /**
   * 更新喜欢数
   * @param id
   * @returns
   */
  async updateLikesById(id, type): Promise<Article> {
    const oldArticle = await this.articleRepository.findOne(id);
    const updatedArticle = await this.articleRepository.merge(oldArticle, {
      likes: type === 'like' ? oldArticle.likes + 1 : oldArticle.likes - 1,
    });
    return this.articleRepository.save(updatedArticle);
  }

  /**
   * 删除文章
   * @param id
   */
  async deleteById(id) {
    const article = await this.articleRepository.findOne(id);
    return this.articleRepository.remove(article);
  }

  /**
   * 关键词搜索文章
   * @param keyword
   */
  async search(keyword) {
    const res = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.title LIKE :keyword')
      .setParameter('keyword', `%${keyword}%`)
      .getMany();

    return res;
  }

  /**
   * 推荐文章
   * @param articleId
   */
  async recommend(articleId = null, pageSize = 6) {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .orderBy('article.publishAt', 'DESC')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags');

    if (!articleId) {
      query.where('article.status=:status').setParameter('status', 'publish');
      return query.take(pageSize).getMany();
    }
    const sub = this.articleRepository
      .createQueryBuilder('article')
      .orderBy('article.publishAt', 'DESC')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .where('article.id=:id')
      .setParameter('id', articleId);
    const exist = await sub.getOne();

    if (!exist) {
      return query.take(pageSize).getMany();
    }

    const { title, summary } = exist;

    try {
      // nodejieba 安装太麻烦
      // const nodejieba = require('nodejieba');
      const kw1 = segment.doSegment(title, {
        stripStopword: true,
      });
      const kw2 = segment.doSegment(summary, {
        stripStopword: true,
      });

      kw1.forEach((kw, i) => {
        const paramKey = `title_` + i;
        if (i === 0) {
          query.where(`article.title LIKE :${paramKey}`);
        } else {
          query.orWhere(`article.title LIKE :${paramKey}`);
        }
        query.setParameter(paramKey, `%${kw.w}%`);
      });

      kw2.forEach((kw, i) => {
        const paramKey = `summary_` + i;
        if (!kw1.length) {
          query.where(`article.summary LIKE :${paramKey}`);
        } else {
          query.orWhere(`article.summary LIKE :${paramKey}`);
        }
        query.setParameter(paramKey, `%${kw.w}%`);
      });
    } catch (e) {} // eslint-disable-line no-empty

    const data = await query.getMany();
    return data.filter((d) => d.id !== articleId && d.status === 'publish').slice(0, pageSize);
  }
}
