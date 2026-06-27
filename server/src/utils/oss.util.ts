import { HttpException, HttpStatus } from '@nestjs/common';

import { ApiMsg } from '../common/api-messages';
import { SettingService } from '../modules/setting/setting.service';
import { AliyunOssClient } from './oss/aliyun-oss-client';
import { OssClient } from './oss/oss-client';

export class Oss {
  settingService: SettingService;
  config: Record<string, unknown>;
  ossClient: OssClient;

  constructor(settingService: SettingService) {
    this.settingService = settingService;
  }

  /**
   * 是否有OSS的配置
   */
  public async hasOssConfig() {
    try {
      const data = await this.settingService.findAll(true);
      const config = JSON.parse(data.oss);
      return !!config;
    } catch (e) {
      return false;
    }
  }

  private async getConfig() {
    const data = await this.settingService.findAll(true);
    const config = JSON.parse(data.oss);
    if (!config) {
      throw new HttpException(ApiMsg.OSS_CONFIG_INCOMPLETE, HttpStatus.BAD_REQUEST);
    }
    return config as Record<string, unknown>;
  }

  private async getOssClient() {
    const config = await this.getConfig();
    const type = String(config.type).toLowerCase();

    switch (type) {
      case 'aliyun':
      default:
        return new AliyunOssClient(config);
    }
  }

  async putFile(filepath: string, buffer: Buffer) {
    const client = await this.getOssClient();
    const url = await client.putFile(filepath, buffer);
    return url;
  }

  async getFile(filepath: string): Promise<Buffer> {
    const client = await this.getOssClient();
    return client.getFile(filepath);
  }

  async deleteFile(url: string) {
    const client = await this.getOssClient();
    await client.deleteFile(url);
  }
}
