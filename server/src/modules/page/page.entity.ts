import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Page {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ default: null })
  cover: string; // 页面封面

  @ApiProperty()
  @Column()
  name: string; // 页面名

  @ApiProperty()
  @Column()
  path: string; // 页面路径

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  order: number; // 顺序

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
  @Column('simple-enum', { enum: ['draft', 'publish'] })
  status: string; // 页面状态

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publishAt: Date; // 发布日期

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  views: number; // 阅读量

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
