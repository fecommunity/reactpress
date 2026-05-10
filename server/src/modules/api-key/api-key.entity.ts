import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ description: 'bcrypt hash of the raw key' })
  @Column({ select: false })
  keyHash: string;

  @ApiProperty({ description: 'Comma-separated scopes: read, write' })
  @Column({ default: 'read' })
  scopes: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 8, nullable: true })
  keyPrefix: string;

  @ApiProperty()
  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'create_at' })
  createAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  updateAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt: Date;
}
