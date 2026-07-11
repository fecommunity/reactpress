import * as fs from 'fs';
import * as path from 'path';

function resolveUploadRoot(): string {
  const fromEnv = process.env.REACTPRESS_UPLOAD_DIR?.trim();
  if (fromEnv) return fromEnv;
  return path.join(__dirname, '../../public/uploads');
}

export class LocalUpload {
  private readonly uploadRoot: string;

  constructor() {
    this.uploadRoot = resolveUploadRoot();
  }

  // 递归创建目录 同步方法
  private mkdDirsSync(dirname: string) {
    if (fs.existsSync(dirname)) {
      return true;
    }
    if (this.mkdDirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
    return false;
  }

  public putFile(filename: string, buffer: Buffer) {
    const saveFile = path.join(this.uploadRoot, filename);
    const dirName = path.dirname(saveFile);
    this.mkdDirsSync(dirName);
    fs.writeFileSync(saveFile, buffer);
    return saveFile;
  }

  public getFile(filename: string): Buffer {
    const filePath = path.join(this.uploadRoot, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filename}`);
    }
    return fs.readFileSync(filePath);
  }

  public deleteFile(filename: string) {
    const filePath = path.join(this.uploadRoot, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
