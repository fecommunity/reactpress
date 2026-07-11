import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApiMsg } from '../../common/api-messages';
import { SettingService } from '../setting/setting.service';
import { sendEmail, SmtpTransportConfig } from './mail.util';
import { SMTP } from './smtp.entity';

export type SmtpConfigOverride = {
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromUser?: string;
};

export type TestSmtpPayload = SmtpConfigOverride & {
  to: string;
};

@Injectable()
export class SMTPService {
  constructor(
    @InjectRepository(SMTP)
    private readonly smtpRepository: Repository<SMTP>,
    private readonly settingService: SettingService
  ) {}

  private async resolveSmtpConfig(override: SmtpConfigOverride = {}): Promise<{
    transport: SmtpTransportConfig;
    from: string;
  }> {
    const setting = await this.settingService.findAll(true);
    const host = (override.smtpHost ?? setting.smtpHost ?? '').trim();
    const port = (override.smtpPort ?? setting.smtpPort ?? '').trim();
    const user = (override.smtpUser ?? setting.smtpUser ?? '').trim();
    const pass = (override.smtpPass ?? setting.smtpPass ?? '').trim();
    const from = (override.smtpFromUser ?? setting.smtpFromUser ?? user).trim();

    if (!host || !port || !user || !pass || !from) {
      throw new HttpException(ApiMsg.EMAIL_CONFIG_INCOMPLETE, HttpStatus.BAD_REQUEST);
    }

    return {
      transport: { host, port, user, pass },
      from,
    };
  }

  /**
   * 发送测试邮件（不写入发信记录）
   */
  async testSend(payload: TestSmtpPayload): Promise<{ ok: true }> {
    const to = (payload.to ?? '').trim();
    if (!to) {
      throw new HttpException(ApiMsg.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { transport, from } = await this.resolveSmtpConfig(payload);
    await sendEmail(
      {
        from,
        to,
        subject: ApiMsg.EMAIL_TEST_SUBJECT,
        html: ApiMsg.EMAIL_TEST_HTML,
      },
      transport,
    ).catch(() => {
      throw new HttpException(ApiMsg.EMAIL_SEND_FAILED, HttpStatus.BAD_REQUEST);
    });

    return { ok: true };
  }

  /**
   * 添加邮件，发送邮件并保存
   * @param SMTP
   */
  async create(data: Partial<SMTP>): Promise<SMTP> {
    const { transport, from } = await this.resolveSmtpConfig();
    Object.assign(data, {
      from,
    });
    await sendEmail(data, transport).catch(() => {
      throw new HttpException(ApiMsg.EMAIL_SEND_FAILED, HttpStatus.BAD_REQUEST);
    });
    const newSMTP = await this.smtpRepository.create(data);
    await this.smtpRepository.save(newSMTP);
    return newSMTP;
  }

  /**
   * 获取所有邮件
   */
  async findAll(queryParams): Promise<[SMTP[], number]> {
    const query = this.smtpRepository.createQueryBuilder('smtp').orderBy('smtp.createAt', 'DESC');

    if (typeof queryParams === 'object') {
      const { page = 1, pageSize = 12, ...otherParams } = queryParams;
      query.skip((+page - 1) * +pageSize);
      query.take(+pageSize);

      if (otherParams) {
        Object.keys(otherParams).forEach((key) => {
          query.andWhere(`smtp.${key} LIKE :${key}`).setParameter(`${key}`, `%${otherParams[key]}%`);
        });
      }
    }

    return query.getManyAndCount();
  }

  /**
   * 删除邮件
   * @param id
   */
  async deleteById(id) {
    const SMTP = await this.smtpRepository.findOne(id);
    return this.smtpRepository.remove(SMTP);
  }
}
