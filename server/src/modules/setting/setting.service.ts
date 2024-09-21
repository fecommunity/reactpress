import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as merge from 'deepmerge';
import { Repository } from 'typeorm';

import { i18n, UNPROTECTED_KEYS } from './setting.constant';
import { Setting } from './setting.entity';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>
  ) {
    this.initI18n();
  }

  /**
   * 初始化时加载 i18n 配置
   */
  async initI18n() {
    const items = await this.settingRepository.find();
    const target = (items && items[0]) || ({} as Setting);
    let data = {};
    try {
      data = JSON.parse(target.i18n);
    } catch (e) {
      data = {};
    }
    target.i18n = JSON.stringify(merge({}, i18n, data));
    await this.settingRepository.save(target);
  }

  /**
   *
   * 获取系统设置
   * @param user
   * @param innerInvoke
   * @param isAdmin
   */
  async findAll(innerInvoke = false, isAdmin = false): Promise<Setting> {
    const data = await this.settingRepository.find();
    const res = data[0];
    if (!res) {
      return {} as Setting;
    }
    if (innerInvoke || isAdmin) {
      return res;
    }
    const filterRes = UNPROTECTED_KEYS.reduce((a, c) => {
      a[c] = res[c];
      return a;
    }, {}) as Setting;

    return filterRes;
  }

  /**
   * 更新系统设置
   * @param id
   * @param setting
   */
  async update(setting: Partial<Setting>): Promise<Setting> {
    const old = await this.settingRepository.find();

    const updatedTag =
      old && old[0]
        ? await this.settingRepository.merge(old[0], setting)
        : await this.settingRepository.create(setting);
    return this.settingRepository.save(updatedTag);
  }
}
