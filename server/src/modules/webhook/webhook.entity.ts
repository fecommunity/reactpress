import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('webhooks')
export class Webhook {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  url: string;

  @ApiProperty()
  @Column({ select: false })
  secret: string;

  @ApiProperty({ description: 'Comma-separated: article.published, comment.created' })
  @Column()
  events: string;

  @ApiProperty()
  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'create_at' })
  createAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updateAt: Date;
}
