import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class View {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  ip: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  userAgent: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  url: string;

  @ApiProperty()
  @Column({ default: 1 })
  count: number; // 同一 userAgent ，同一 url 的访问量

  @ApiProperty()
  @Column({ type: 'text', default: null })
  address: string; // 访问地址

  @ApiProperty()
  @Column({ type: 'text', default: null })
  browser: string; // 访问浏览器

  @ApiProperty()
  @Column({ type: 'text', default: null })
  engine: string; // 访问的浏览器内核

  @ApiProperty()
  @Column({ type: 'text', default: null })
  os: string; // 访问操作系统

  @ApiProperty()
  @Column({ type: 'text', default: null })
  device: string; // 访问设备

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
