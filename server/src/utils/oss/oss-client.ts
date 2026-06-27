export abstract class OssClient {
  config: Record<string, unknown>;

  constructor(config) {
    this.config = config;
  }

  abstract putFile(filepath: string, buffer: Buffer): Promise<string>;
  abstract getFile(filepath: string): Promise<Buffer>;
  abstract deleteFile(url: string): Promise<void>;
}
