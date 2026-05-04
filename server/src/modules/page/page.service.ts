import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { dateFormat } from '../../utils/date.util';
import { Page } from './page.entity';

@Injectable()
export class PageService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>
  ) {}

  /**
   * 新建页面
   * @param page
   */
  async create(page: Partial<Page>): Promise<Page> {
    const { path } = page;
    const exist = await this.pageRepository.findOne({ where: { path } });

    if (exist) {
      throw new HttpException('页面已存在', HttpStatus.BAD_REQUEST);
    }

    const newPage = await this.pageRepository.create({
      ...page,
    });
    await this.pageRepository.save(newPage);
    return newPage;
  }

  /**
   * 获取所有页面
   */
  async findAll(queryParams): Promise<[Page[], number]> {
    const query = this.pageRepository.createQueryBuilder('page').orderBy('publishAt', 'DESC');

    if (typeof queryParams === 'object') {
      const { page = 1, pageSize = 12, status, ...otherParams } = queryParams;
      query.skip((+page - 1) * +pageSize);
      query.take(+pageSize);

      if (status) {
        query.andWhere('page.status=:status').setParameter('status', status);
      }
      if (otherParams) {
        Object.keys(otherParams).forEach((key) => {
          query.andWhere(`page.${key} LIKE :${key}`).setParameter(`${key}`, `%${otherParams[key]}%`);
        });
      }
    }

    return query.getManyAndCount();
  }

  /**
   * 获取指定页面信息
   * @param id
   */
  async findById(id): Promise<Page> {
    const query = this.pageRepository
      .createQueryBuilder('page')
      .where('page.id=:id')
      .orWhere('page.path=:path')
      .setParameter('id', id)
      .setParameter('path', id);

    return query.getOne();
  }

  /**
   * 更新指定文章阅读量 + 1
   * @param id
   * @param article
   */
  async updateViewsById(id): Promise<Page> {
    const old = await this.pageRepository.findOne(id);
    const newData = await this.pageRepository.merge(old, {
      views: old.views + 1,
    });
    return this.pageRepository.save(newData);
  }

  /**
   * 更新指定页面
   * @param id
   * @param article
   */
  async updateById(id, page: Partial<Page>): Promise<Page> {
    const old = await this.pageRepository.findOne(id);
    const { status } = page;

    const newPage = {
      ...page,
      publishAt: status === 'publish' ? dateFormat() : old && old.publishAt,
    };

    const updatedPage = await this.pageRepository.merge(old, newPage);
    return this.pageRepository.save(updatedPage);
  }

  /**
   * 删除页面
   * @param id
   */
  async deleteById(id) {
    const page = await this.pageRepository.findOne(id);
    return this.pageRepository.remove(page);
  }
}
