import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Article } from './article.entity';

@Entity('article_revisions')
export class ArticleRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  article: Article;

  @Column()
  articleId: string;

  @Column()
  title: string;

  @Column({ type: 'mediumtext', nullable: true })
  content: string;

  @Column({ type: 'mediumtext', nullable: true })
  html: string;

  @Column('simple-enum', { enum: ['draft', 'publish'] })
  status: string;

  @CreateDateColumn({ name: 'create_at' })
  createAt: Date;
}
