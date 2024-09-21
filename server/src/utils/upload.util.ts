import * as fs from 'fs';
import * as path from 'path';

export class LocalUpload {
  // 递归创建目录 同步方法
  private mkdDirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (this.mkdDirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }

  public putFile(filename, buffer: ReadableStream) {
    const saveFile = path.join(__dirname, `../../public/uploads/${filename}`);
    const dirName = path.dirname(saveFile);
    // 递归创建目录
    this.mkdDirsSync(dirName);
    // 创建文件
    fs.writeFileSync(saveFile, buffer);
    return saveFile;
  }

  public deleteFile(filename) {
    const saveFileFolder = path.join(__dirname, '../../public/uploads');
    const filePath = `${saveFileFolder}/${filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
