import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { dateFormat } from '../../utils/date.util';
import { Knowledge } from './knowledge.entity';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(Knowledge)
    private readonly repository: Repository<Knowledge>
  ) {}

  /**
   * 新建知识库
   * @param knowledge
   */
  async createKnowledgeBook(knowledge: Partial<Knowledge>): Promise<Knowledge> {
    const { title, status, parentId } = knowledge;

    const exist = await this.repository.findOne({ where: { title } });
    if (exist && !parentId) {
      // 章节不考虑重名
      throw new HttpException('知识库已存在', HttpStatus.BAD_REQUEST);
    }

    if (status === 'publish') {
      Object.assign(knowledge, { publishAt: dateFormat() });
    }

    const data = await this.repository.create(knowledge);
    await this.repository.save(data);
    return data;
  }

  /**
   * 新建知识章节
   * @param knowledge
   */
  async createKnowledgeChapter(knowledges: Partial<Knowledge> | Array<Partial<Knowledge>>): Promise<Array<Knowledge>> {
    if (!Array.isArray(knowledges)) {
      knowledges = [knowledges];
    }
    if (knowledges.some((knowledge) => !knowledge.parentId)) {
      throw new HttpException('无效的知识库章节', HttpStatus.BAD_REQUEST);
    }
    const result = [];
    for (const knowledge of knowledges) {
      result.push(await this.createKnowledgeBook(knowledge));
    }
    return result;
  }

  /**
   * 删除章节
   * @param id
   */
  async deleteById(id) {
    const data = await this.repository.findOne(id);
    if (!data.parentId) {
      const query = this.repository
        .createQueryBuilder('knowledge')
        .where('knowledge.parentId=:parentId')
        .setParameter('parentId', data.id);
      const children = await query.getMany();
      if (children.length) {
        for (const item of children) {
          await this.repository.remove(item);
        }
      }
    }
    return this.repository.remove(data);
  }

  /**
   * 更新指定知识
   * @param id
   * @param data
   */
  async updateById(id, data: Partial<Knowledge>): Promise<Knowledge> {
    const oldData = await this.repository.findOne(id);
    const { status } = oldData;
    const newData = {
      ...data,
      views: oldData.views,
      publishAt: oldData.status === 'draft' && status === 'publish' ? dateFormat() : oldData.publishAt,
    };
    const result = await this.repository.merge(oldData, newData);
    await this.repository.save(result);
    return result;
  }

  /**
   * 更新指定文章阅读量 + 1
   * @param id
   * @param article
   */
  async updateViewsById(id): Promise<Knowledge> {
    const oldData = await this.repository.findOne(id);
    const newData = await this.repository.merge(oldData, {
      views: oldData.views + 1,
    });
    return this.repository.save(newData);
  }

  /**
   * 更新喜欢数
   * @param id
   * @returns
   */
  async updateLikesById(id, type): Promise<Knowledge> {
    const oldData = await this.repository.findOne(id);
    const newData = await this.repository.merge(oldData, {
      likes: type === 'like' ? oldData.likes + 1 : oldData.likes - 1,
    });
    return this.repository.save(newData);
  }

  /**
   * 获取所有知识库
   */
  async findAll(queryParams): Promise<[Knowledge[], number]> {
    const query = this.repository
      .createQueryBuilder('knowledge')
      .orderBy('knowledge.publishAt', 'DESC')
      .where('knowledge.parentId is :parentId')
      .setParameter('parentId', null);

    const { page = 1, pageSize = 12, status, ...otherParams } = queryParams;
    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);
    if (status) {
      query.andWhere('knowledge.status=:status').setParameter('status', status);
    }
    if (otherParams) {
      Object.keys(otherParams).forEach((key) => {
        query.andWhere(`knowledge.${key} LIKE :${key}`).setParameter(`${key}`, `%${otherParams[key]}%`);
      });
    }
    const [data, total] = await query.getManyAndCount();
    return [data, total];
  }

  /**
   * 获取指定文章信息
   * @param id
   */
  async findById(id): Promise<Partial<Knowledge>> {
    const data = (await this.repository.findOne(id)) as Partial<Knowledge>;

    if (!data) {
      return null;
    }

    if (!data.parentId) {
      const query = this.repository
        .createQueryBuilder('knowledge')
        .where('knowledge.parentId=:parentId')
        .setParameter('parentId', data.id);
      const children = await query.getMany();
      children.sort((a, b) => a.order - b.order);
      Object.assign(data, { children: children || [] });
    }

    return data;
  }
}
