import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { Repository } from 'typeorm';

import { dateFormat } from '../../utils/date.util';
import {
  buildVariantFilename,
  ImageScene,
  ImageVariantMeta,
  isProcessableImage,
  listVariantFilenames,
  primaryVariantForScene,
  processImageVariants,
  variantsForScene,
} from '../../utils/image-processor.util';
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

  private getUploadBaseUrl(): string {
    return (
      this.configService.get('SERVER_PUBLIC_UPLOAD_URL') ||
      `${this.configService.get('SERVER_SITE_URL')}/public/uploads`
    );
  }

  private async persistBuffer(filename: string, buffer: Buffer, hasOssConfig: boolean): Promise<string> {
    if (hasOssConfig) {
      return this.oss.putFile(filename, buffer);
    }

    await this.localUpload.putFile(filename, buffer);
    return `${this.getUploadBaseUrl()}/${filename}`;
  }

  private async removeStoredFile(filename: string, hasOssConfig: boolean): Promise<void> {
    if (hasOssConfig) {
      await this.oss.deleteFile(filename);
      return;
    }

    await this.localUpload.deleteFile(filename);
  }

  /**
   * 上传文件
   * @param file
   */
  async uploadFile(file, unique, scene: ImageScene = 'default'): Promise<File> {
    let { originalname, mimetype, size, buffer } = file;
    const dataFolder = dateFormat(new Date(), 'yyyy-MM-dd');
    const ext = path.extname(originalname);
    const hasOssConfig = await this.oss.hasOssConfig();

    if (isProcessableImage(mimetype)) {
      const baseName = +unique === 1 ? path.basename(originalname, ext) : uniqueid();
      const baseFilename = `${dataFolder}/${baseName}.webp`;
      const variantList = variantsForScene(scene);
      const processedVariants = await processImageVariants(buffer, variantList);
      const variantsMeta: Record<string, ImageVariantMeta> = {};

      for (const [variant, processed] of processedVariants.entries()) {
        const variantFilename = buildVariantFilename(baseFilename, variant);
        const variantUrl = await this.persistBuffer(variantFilename, processed.buffer, hasOssConfig);

        variantsMeta[variant] = {
          url: variantUrl,
          filename: variantFilename,
          width: processed.width,
          height: processed.height,
          size: processed.size,
        };
      }

      const primaryVariant = primaryVariantForScene(scene);
      const primary = variantsMeta[primaryVariant];

      const newFile = await this.fileRepository.create({
        originalname: `${path.basename(originalname, ext)}.webp`,
        filename: primary.filename,
        url: primary.url,
        type: 'image/webp',
        size: primary.size,
        variants: variantsMeta,
      });
      await this.fileRepository.save(newFile);
      return newFile;
    }

    const filename = +unique === 1 ? `${dataFolder}/${originalname}` : `${dataFolder}/${uniqueid()}.${ext}`;
    const url = await this.persistBuffer(filename, buffer, hasOssConfig);
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
    if (!target) {
      throw new HttpException('File not found', 404);
    }

    const hasOssConfig = await this.oss.hasOssConfig();
    const filenames = target.variants
      ? Object.values(target.variants).map((variant) => variant.filename)
      : isProcessableImage(target.type)
        ? listVariantFilenames(target.filename)
        : [target.filename];

    for (const filename of filenames) {
      await this.removeStoredFile(filename, hasOssConfig);
    }

    return this.fileRepository.remove(target);
  }
}
