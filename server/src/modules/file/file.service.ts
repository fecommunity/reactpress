import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { Repository } from 'typeorm';

import { dateFormat } from '../../utils/date.util';
import { Oss } from '../../utils/oss.util';
import { uniqueid } from '../../utils/uniqueid.util';
import { LocalUpload } from '../../utils/upload.util';
import { SettingService } from '../setting/setting.service';
import { File } from './file.entity';

@Injectable()
export class FileService {
  private oss: Oss;
  private localUpload: LocalUpload;

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly settingService: SettingService,
    private readonly configService: ConfigService
  ) {
    this.oss = new Oss(this.settingService);
    this.localUpload = new LocalUpload();
  }

  /**
   * 上传文件
   * @param file
   */
  async uploadFile(file, unique): Promise<File> {
    const { originalname, mimetype, size, buffer } = file;
    const dataFolder = dateFormat(new Date(), 'yyyy-MM-dd');
    const ext = path.extname(originalname);
    const filename = +unique === 1 ? `${dataFolder}/${originalname}` : `${dataFolder}/${uniqueid()}.${ext}`;
    // 获取oss的配置
    const hasOssConfig = await this.oss.hasOssConfig();
    let url;
    if (hasOssConfig) {
      // 上传到OSS
      url = await this.oss.putFile(filename, buffer);
    } else {
      // 本地上传
      url = await this.localUpload.putFile(filename, buffer);
      // 上传的路径
      const uploadUrl =
        this.configService.get('SERVER_PUBLIC_UPLOAD_URL') || `${this.configService.get('SERVER_SITE_URL')}/public/uploads`;
      // 最终的地址
      url = `${uploadUrl}/${filename}`;
    }
    const newFile = await this.fileRepository.create({
      originalname,
      filename,
      url,
      type: mimetype,
      size,
    });
    await this.fileRepository.save(newFile);
    return newFile;
  }

  /**
   * 获取所有文件
   */
  async findAll(queryParams): Promise<[File[], number]> {
    const query = this.fileRepository.createQueryBuilder('file').orderBy('file.createAt', 'DESC');

    if (typeof queryParams === 'object') {
      const { page = 1, pageSize = 12, ...otherParams } = queryParams;
      query.skip((+page - 1) * +pageSize);
      query.take(+pageSize);

      if (otherParams) {
        Object.keys(otherParams).forEach((key) => {
          query.andWhere(`file.${key} LIKE :${key}`).setParameter(`${key}`, `%${otherParams[key]}%`);
        });
      }
    }

    return query.getManyAndCount();
  }

  /**
   * 获取指定文件
   * @param id
   */
  async findById(id): Promise<File> {
    return this.fileRepository.findOne(id);
  }

  async findByIds(ids): Promise<Array<File>> {
    return this.fileRepository.findByIds(ids);
  }

  /**
   * 删除文件
   * @param id
   */
  async deleteById(id) {
    const target = await this.fileRepository.findOne(id);
    const hasOssConfig = await this.oss.hasOssConfig();
    if (hasOssConfig) {
      // 先删除oss的配置
      await this.oss.deleteFile(target.filename);
    } else {
      // 删除本地的文件
      await this.localUpload.deleteFile(target.filename);
    }
    return this.fileRepository.remove(target);
  }
}
