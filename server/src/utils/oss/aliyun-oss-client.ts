import * as AliyunOSS from 'ali-oss';

import { OssClient } from './oss-client';

export class AliyunOssClient extends OssClient {
  private async buildClient() {
    const config = this.config;
    return new AliyunOSS({
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      bucket: config.bucket,
      secure: config.https,
    });
  }

  async putFile(filepath: string, buffer: ReadableStream) {
    const client = await this.buildClient();
    const { url } = await client.put(filepath, buffer);
    return url;
  }

  async deleteFile(url: string) {
    const client = await this.buildClient();
    await client.delete(url);
  }
}
