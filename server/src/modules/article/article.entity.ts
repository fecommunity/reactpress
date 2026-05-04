import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../category/category.entity';
import { Tag } from '../tag/tag.entity';

@Entity()
export class Article {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column({ default: null })
  cover: string; // 封面图

  @ApiProperty()
  @Column({ type: 'text', default: null })
  summary: string; // 摘要，自动生成

  @ApiProperty()
  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
  content: string; // 原始内容

  @ApiProperty()
  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
  html: string; // 格式化内容，自动生成

  @ApiProperty()
  @Column({ type: 'mediumtext', default: null })
  toc: string; // 格式化内容索引，自动生成

  @ApiProperty()
  @ManyToOne(() => Category, (category) => category.articles, { cascade: true })
  @JoinTable()
  category: Category;

  @ApiProperty()
  @ManyToMany(() => Tag, (tag) => tag.articles, { cascade: true })
  @JoinTable()
  tags: Array<Tag>;

  @ApiProperty()
  @Column('simple-enum', { enum: ['draft', 'publish'] })
  status: string; // 文章状态

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  views: number; // 阅读量

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  likes: number; // 喜欢数

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  isRecommended: boolean; // 是否推荐到首页

  @ApiProperty()
  @Column({ type: 'text', default: null, select: false })
  password: string;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  needPassword: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: true })
  isCommentable: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publishAt: Date; // 发布日期

  @ApiProperty()
  @CreateDateColumn({
    type: 'datetime',
    comment: '创建时间',
    name: 'create_at',
  })
  createAt: Date;

  @ApiProperty()
  @UpdateDateColumn({
    type: 'datetime',
    comment: '更新时间',
    name: 'update_at',
  })
  updateAt: Date;
}
