import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { dateFormat } from '../../utils/date.util';
import { CategoryService } from '../category/category.service';
import { TagService } from '../tag/tag.service';
import { Article } from './article.entity';
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
    private readonly tagService: TagService,
    private readonly categoryService: CategoryService
  ) {}

  /**
   * 创建文章
   * @param article
   */
  async create(article: Partial<Article>): Promise<Article> {
    const { title } = article;
    const exist = await this.articleRepository.findOne({ where: { title } });

    if (exist) {
      throw new HttpException('文章标题已存在', HttpStatus.BAD_REQUEST);
    }

    let { tags, category, status } = article; // eslint-disable-line prefer-const

    if (status === 'publish') {
      Object.assign(article, {
        publishAt: dateFormat(),
      });
    }

    tags = await this.tagService.findByIds(('' + tags).split(','));
    const existCategory = await this.categoryService.findById(category);
    const newArticle = await this.articleRepository.create({
      ...article,
      category: existCategory,
      tags,
      needPassword: !!article.password,
    });
    await this.articleRepository.save(newArticle);
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

    if (otherParams) {
      Object.keys(otherParams).forEach((key) => {
        query.andWhere(`article.${key} LIKE :${key}`).setParameter(`${key}`, `%${otherParams[key]}%`);
      });
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
      .setParameter('id', id)
      .setParameter('title', id);

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
    let { tags, category, status } = article; // eslint-disable-line prefer-const

    if (tags) {
      tags = await this.tagService.findByIds(('' + tags).split(','));
    }

    const existCategory = await this.categoryService.findById(category);

    const newArticle = {
      ...article,
      views: oldArticle.views,
      category: existCategory,
      needPassword: !!article.password,
      publishAt: oldArticle.status === 'draft' && status === 'publish' ? dateFormat() : oldArticle.publishAt,
    };

    if (tags) {
      Object.assign(newArticle, { tags });
    }

    const updatedArticle = await this.articleRepository.merge(oldArticle, newArticle);
    return this.articleRepository.save(updatedArticle);
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
  async recommend(articleId = null) {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .orderBy('article.publishAt', 'DESC')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags');

    if (!articleId) {
      query.where('article.status=:status').setParameter('status', 'publish');
      return query.take(6).getMany();
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
      return query.take(6).getMany();
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
    return data.filter((d) => d.id !== articleId && d.status === 'publish');
  }
}
