import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Setting {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'text', default: null })
  i18n: string; // 国际化

  @ApiProperty()
  @Column({ type: 'text', default: null })
  globalSetting: string; // 导航设置

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemUrl: string; // 系统地址

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemTitle: string; // 系统标题

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemSubTitle: string; // 系统副标题

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemLogo: string; // 系统Logo

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemBg: string; // 全局背景

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemFavicon: string; // 系统 favicon

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemNoticeInfo: string; // 系统通知信息

  @ApiProperty()
  @Column({ type: 'text', default: null })
  systemFooterInfo: string; // 系统页脚

  @ApiProperty()
  @Column({ type: 'text', default: null })
  adminSystemUrl: string; // 后台系统地址

  @ApiProperty()
  @Column({ type: 'text', default: null })
  baiduAnalyticsId: string; // 百度统计id

  @ApiProperty()
  @Column({ type: 'text', default: null })
  googleAnalyticsId: string; // 谷歌分析 id

  @ApiProperty()
  @Column({ type: 'text', default: null })
  seoKeyword: string; // SEO 关键词

  @ApiProperty()
  @Column({ type: 'text', default: null })
  seoDesc: string; // SEO 描述

  @ApiProperty()
  @Column({ type: 'text', default: null })
  oss: string; // OSS 上传配置

  @ApiProperty()
  @Column({ type: 'text', default: null })
  smtpHost: string; // SMTP 地址

  @ApiProperty()
  @Column({ type: 'text', default: null })
  smtpPort: string; // SMTP 端口

  @ApiProperty()
  @Column({ type: 'text', default: null })
  smtpUser: string; // SMTP 用户

  @ApiProperty()
  @Column({ type: 'text', default: null })
  smtpPass: string; // SMTP 授权码

  @ApiProperty()
  @Column({ type: 'text', default: null })
  smtpFromUser: string; // SMTP 发件人

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
