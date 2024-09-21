import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SMTP {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  from: string; // 发件人

  @ApiProperty()
  @Column({ type: 'text', default: null })
  to: string; // 收件人

  @ApiProperty()
  @Column({ type: 'text', default: null })
  subject: string; // 主题

  @ApiProperty()
  @Column({ type: 'text', default: null })
  text: string; // 文本内容

  @ApiProperty()
  @Column({ type: 'text', default: null })
  html: string; // html 内容

  @ApiProperty()
  @CreateDateColumn({
    type: 'datetime',
    comment: '创建时间',
    name: 'create_at',
  })
  createAt: Date;
}
