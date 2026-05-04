import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettingService } from '../setting/setting.service';
import { sendEmail } from './mail.util';
import { SMTP } from './smtp.entity';

@Injectable()
export class SMTPService {
  constructor(
    @InjectRepository(SMTP)
    private readonly smtpRepository: Repository<SMTP>,
    private readonly settingService: SettingService
  ) {}

  /**
   * 添加邮件，发送邮件并保存
   * @param SMTP
   */
  async create(data: Partial<SMTP>): Promise<SMTP> {
    const setting = await this.settingService.findAll(true);
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFromUser } = setting;
    Object.assign(data, {
      from: smtpFromUser,
    });
    await sendEmail(data, {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
    }).catch(() => {
      throw new HttpException('邮件发送失败', HttpStatus.BAD_REQUEST);
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
