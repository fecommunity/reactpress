import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Comment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  email: string; // 联系方式

  @ApiProperty()
  @Column()
  avatar: string;

  @ApiProperty()
  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' }) // 评论内容
  content: string;

  @ApiProperty()
  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' }) // 评论内容
  html: string;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  pass: boolean; // 是否审核通过

  @ApiProperty()
  @Column({ type: 'mediumtext', default: null, charset: 'utf8mb4' })
  userAgent: string;

  @ApiProperty()
  @Column()
  hostId: string; // 关联文章或页面 id

  @ApiProperty()
  @Column()
  url: string; // 关联页面路径，可与 systemUrl 拼接

  @ApiProperty()
  @Column({ default: null })
  parentCommentId: string; // 父级评论 id

  @ApiProperty()
  @Column({ default: null })
  replyUserName: string; // 回复评论用户名

  @ApiProperty()
  @Column({ default: null })
  replyUserEmail: string; // 回复评论邮箱

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
