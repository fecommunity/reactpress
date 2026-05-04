import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Knowledge {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ default: null })
  parentId: string; // 父级 id，如果该项为空，则是书的封面，不为空则是一个章节

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  order: number; // 章节排序

  @ApiProperty()
  @Column()
  title: string; // 标题

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
  @Column('simple-enum', { enum: ['draft', 'publish'], default: 'draft' })
  status: string; // 文章状态

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  views: number; // 阅读量

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  likes: number; // 喜欢数

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
