import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { Repository } from 'typeorm';
import { uniqueid } from '../../utils/uniqueid.util';

import { dateFormat } from '../../utils/date.util';
import {
  buildVariantFilename,
  ImageVariantMeta,
  isProcessableImage,
  primaryVariantForScene,
  processImageVariants,
  variantsForScene,
} from '../../utils/image-processor.util';
import { Oss } from '../../utils/oss.util';
import { LocalUpload } from '../../utils/upload.util';
import { resolveUploadBaseUrl, rewriteBrokenUploadUrl } from '../../utils/upload-url.util';
import { ArticleRevision } from '../article/article-revision.entity';
import { Article } from '../article/article.entity';
import { Page } from '../page/page.entity';
import { SettingService } from '../setting/setting.service';
import { File } from './file.entity';
import {
  ImageOptimizeReport,
  OptimizeJob,
  OptimizeJobItemResult,
  OptimizeRunOptions,
  RewriteContentResult,
} from './file-optimization.types';

const ESTIMATED_RATIO = 0.4;

function hasVariants(file: File): boolean {
  return Boolean(file.variants && Object.keys(file.variants).length > 0);
}

function isGifType(type: string): boolean {
  return String(type || '').toLowerCase() === 'image/gif';
}

function isSvgType(type: string): boolean {
  return String(type || '').toLowerCase() === 'image/svg+xml';
}

@Injectable()
export class FileOptimizationService {
  private readonly logger = new Logger(FileOptimizationService.name);
  private readonly oss: Oss;
  private readonly localUpload: LocalUpload;
  private readonly jobs = new Map<string, OptimizeJob>();

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(ArticleRevision)
    private readonly revisionRepository: Repository<ArticleRevision>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    private readonly settingService: SettingService,
    private readonly configService: ConfigService
  ) {
    this.oss = new Oss(this.settingService);
    this.localUpload = new LocalUpload();
  }

  private getUploadBaseUrl(): string {
    return resolveUploadBaseUrl(this.configService);
  }

  private async persistBuffer(filename: string, buffer: Buffer, hasOssConfig: boolean): Promise<string> {
    if (hasOssConfig) {
      return this.oss.putFile(filename, buffer);
    }
    await this.localUpload.putFile(filename, buffer);
    return `${this.getUploadBaseUrl()}/${filename}`;
  }

  private async readStoredFile(filename: string, hasOssConfig: boolean): Promise<Buffer> {
    if (hasOssConfig) {
      return this.oss.getFile(filename);
    }
    return this.localUpload.getFile(filename);
  }

  private async removeStoredFile(filename: string, hasOssConfig: boolean): Promise<void> {
    if (hasOssConfig) {
      await this.oss.deleteFile(filename);
      return;
    }
    await this.localUpload.deleteFile(filename);
  }

  private async fileExists(filename: string, hasOssConfig: boolean): Promise<boolean> {
    try {
      await this.readStoredFile(filename, hasOssConfig);
      return true;
    } catch {
      return false;
    }
  }

  getJob(jobId: string): OptimizeJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new NotFoundException('Optimization job not found');
    }
    return job;
  }

  async analyze(): Promise<ImageOptimizeReport> {
    const files = await this.fileRepository.find({ order: { createAt: 'ASC' } });
    const hasOssConfig = await this.oss.hasOssConfig();

    let alreadyOptimized = 0;
    let needsOptimization = 0;
    let nonImage = 0;
    let svg = 0;
    let gif = 0;
    let missing = 0;
    let currentBytes = 0;
    let estimatedAfterBytes = 0;

    for (const file of files) {
      if (hasVariants(file)) {
        alreadyOptimized += 1;
        currentBytes += file.size ?? 0;
        estimatedAfterBytes += file.size ?? 0;
        continue;
      }

      if (isSvgType(file.type)) {
        svg += 1;
        currentBytes += file.size ?? 0;
        estimatedAfterBytes += file.size ?? 0;
        continue;
      }

      if (!isProcessableImage(file.type)) {
        nonImage += 1;
        currentBytes += file.size ?? 0;
        estimatedAfterBytes += file.size ?? 0;
        continue;
      }

      if (isGifType(file.type)) {
        gif += 1;
        currentBytes += file.size ?? 0;
        estimatedAfterBytes += file.size ?? 0;
        continue;
      }

      const exists = await this.fileExists(file.filename, hasOssConfig);
      if (!exists) {
        missing += 1;
        continue;
      }

      needsOptimization += 1;
      currentBytes += file.size ?? 0;
      estimatedAfterBytes += Math.round((file.size ?? 0) * ESTIMATED_RATIO);
    }

    const [articles, pages] = await Promise.all([
      this.countLegacyContentRefs(this.articleRepository, 'article'),
      this.countLegacyContentRefs(this.pageRepository, 'page'),
    ]);

    return {
      total: files.length,
      alreadyOptimized,
      needsOptimization,
      skipped: { nonImage, svg, gif, missing },
      storageBytes: {
        current: currentBytes,
        estimatedAfter: estimatedAfterBytes,
        estimatedSaved: Math.max(0, currentBytes - estimatedAfterBytes),
      },
      contentRefs: { articles, pages },
    };
  }

  private async countLegacyContentRefs(repo: Repository<Article | Page>, alias: string): Promise<number> {
    return repo
      .createQueryBuilder(alias)
      .where(
        `((${alias}.cover LIKE :upload AND ${alias}.cover NOT LIKE :webp)
          OR (${alias}.html LIKE :upload AND ${alias}.html NOT LIKE :webp))`,
        { upload: '%uploads/%', webp: '%.webp%' }
      )
      .getCount();
  }

  async startJob(options: OptimizeRunOptions = {}): Promise<OptimizeJob> {
    const batchSize = Math.min(Math.max(options.batchSize ?? 50, 1), 200);
    const skipGif = options.skipGif !== false;
    const limit = options.limit && options.limit > 0 ? options.limit : batchSize;
    const candidates = await this.listCandidates(skipGif, limit);

    const job: OptimizeJob = {
      id: uniqueid(),
      status: 'pending',
      dryRun: Boolean(options.dryRun),
      total: candidates.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      savedBytes: 0,
      urlMap: {},
      items: [],
      rewriteContent: Boolean(options.rewriteContent),
      startedAt: new Date().toISOString(),
    };

    this.jobs.set(job.id, job);

    if (candidates.length === 0) {
      job.status = 'completed';
      job.finishedAt = new Date().toISOString();
      return job;
    }

    void this.runJob(job.id, options, candidates);
    return job;
  }

  private async runJob(jobId: string, options: OptimizeRunOptions, candidates: File[]): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'running';

    try {
      const hasOssConfig = await this.oss.hasOssConfig();

      for (const file of candidates) {
        const item = await this.reprocessOne(file, {
          dryRun: job.dryRun,
          hasOssConfig,
          cleanupOriginals: Boolean(options.cleanupOriginals) && !job.dryRun,
        });

        job.items.push(item);
        job.processed += 1;

        if (item.status === 'success') {
          job.succeeded += 1;
          if (item.oldUrl && item.newUrl) {
            job.urlMap[item.oldUrl] = item.newUrl;
            this.addUrlVariants(job.urlMap, item.oldUrl, item.newUrl);
          }
          job.savedBytes += item.savedBytes ?? 0;
        } else if (item.status === 'skipped') {
          job.skipped += 1;
        } else {
          job.failed += 1;
        }
      }

      if (job.rewriteContent && !job.dryRun && Object.keys(job.urlMap).length > 0) {
        job.contentRewrite = await this.rewriteContentUrls(job.urlMap);
      }

      job.status = 'completed';
      job.finishedAt = new Date().toISOString();
    } catch (err) {
      job.status = 'failed';
      job.error = err instanceof Error ? err.message : String(err);
      job.finishedAt = new Date().toISOString();
      this.logger.error(`Optimization job ${jobId} failed: ${job.error}`);
    }
  }

  private addUrlVariants(urlMap: Record<string, string>, oldUrl: string, newUrl: string): void {
    try {
      const oldParsed = new URL(oldUrl, 'http://local');
      const newParsed = new URL(newUrl, 'http://local');
      urlMap[oldParsed.pathname] = newParsed.pathname;
      urlMap[oldParsed.pathname.replace(/^\//, '')] = newParsed.pathname.replace(/^\//, '');
    } catch {
      // ignore malformed URLs
    }
  }

  private async listCandidates(skipGif: boolean, limit: number): Promise<File[]> {
    const files = await this.fileRepository.find({ order: { createAt: 'ASC' } });
    const hasOssConfig = await this.oss.hasOssConfig();
    const result: File[] = [];

    for (const file of files) {
      if (result.length >= limit) break;
      if (hasVariants(file)) continue;
      if (!isProcessableImage(file.type)) continue;
      if (skipGif && isGifType(file.type)) continue;
      const exists = await this.fileExists(file.filename, hasOssConfig);
      if (!exists) continue;
      result.push(file);
    }

    return result;
  }

  private async reprocessOne(
    file: File,
    opts: { dryRun: boolean; hasOssConfig: boolean; cleanupOriginals: boolean }
  ): Promise<OptimizeJobItemResult> {
    const uploadBase = this.getUploadBaseUrl();
    // Keep DB url for content rewrite matching; also expose a display-normalized form.
    const storedUrl = file.url;
    const base: OptimizeJobItemResult = {
      fileId: file.id,
      originalname: file.originalname,
      status: 'failed',
      oldUrl: storedUrl,
    };

    try {
      const buffer = await this.readStoredFile(file.filename, opts.hasOssConfig);
      const variantList = variantsForScene('default');
      const processedVariants = await processImageVariants(buffer, variantList);

      if (opts.dryRun) {
        const primary = primaryVariantForScene('default');
        const processed = processedVariants.get(primary)!;
        return {
          ...base,
          status: 'success',
          savedBytes: Math.max(0, (file.size ?? 0) - processed.size),
        };
      }

      const folder = path.dirname(file.filename);
      const baseFilename = `${folder || dateFormat(new Date(), 'yyyy-MM-dd')}/${uniqueid()}.webp`;
      const variantsMeta: Record<string, ImageVariantMeta> = {};

      for (const [variant, processed] of processedVariants.entries()) {
        const variantFilename = buildVariantFilename(baseFilename, variant);
        const variantUrl = await this.persistBuffer(variantFilename, processed.buffer, opts.hasOssConfig);
        variantsMeta[variant] = {
          url: variantUrl,
          filename: variantFilename,
          width: processed.width,
          height: processed.height,
          size: processed.size,
        };
      }

      const primaryVariant = primaryVariantForScene('default');
      const primary = variantsMeta[primaryVariant];
      const oldFilename = file.filename;
      const oldSize = file.size ?? 0;
      const normalizedOldUrl = rewriteBrokenUploadUrl(storedUrl, uploadBase);

      file.originalname = `${path.basename(file.originalname, path.extname(file.originalname))}.webp`;
      file.filename = primary.filename;
      file.url = primary.url;
      file.type = 'image/webp';
      file.size = primary.size;
      file.variants = variantsMeta;
      await this.fileRepository.save(file);

      if (opts.cleanupOriginals && oldFilename !== primary.filename) {
        await this.removeStoredFile(oldFilename, opts.hasOssConfig);
      }

      return {
        ...base,
        status: 'success',
        // Prefer rewriting broken `undefined/...` URLs when present in content.
        oldUrl: storedUrl.startsWith('undefined/') ? storedUrl : normalizedOldUrl,
        newUrl: primary.url,
        savedBytes: Math.max(0, oldSize - primary.size),
      };
    } catch (err) {
      return {
        ...base,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async rewriteContentUrls(urlMap: Record<string, string>): Promise<RewriteContentResult> {
    const pairs = Object.entries(urlMap).filter(([oldUrl, newUrl]) => oldUrl && newUrl && oldUrl !== newUrl);
    if (pairs.length === 0) {
      return { articles: 0, pages: 0, revisions: 0 };
    }

    let articles = 0;
    let pages = 0;
    let revisions = 0;

    for (const [oldUrl, newUrl] of pairs) {
      const pattern = `%${oldUrl}%`;

      const articleResult = await this.articleRepository
        .createQueryBuilder()
        .update(Article)
        .set({
          cover: () => `REPLACE(cover, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
          content: () => `REPLACE(content, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
          html: () => `REPLACE(html, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
        })
        .where('cover LIKE :pattern OR content LIKE :pattern OR html LIKE :pattern', { pattern })
        .execute();

      articles += articleResult.affected ?? 0;

      const revisionResult = await this.revisionRepository
        .createQueryBuilder()
        .update(ArticleRevision)
        .set({
          content: () => `REPLACE(content, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
          html: () => `REPLACE(html, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
        })
        .where('content LIKE :pattern OR html LIKE :pattern', { pattern })
        .execute();

      revisions += revisionResult.affected ?? 0;

      const pageResult = await this.pageRepository
        .createQueryBuilder()
        .update(Page)
        .set({
          cover: () => `REPLACE(cover, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
          content: () => `REPLACE(content, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
          html: () => `REPLACE(html, '${this.escapeSql(oldUrl)}', '${this.escapeSql(newUrl)}')`,
        })
        .where('cover LIKE :pattern OR content LIKE :pattern OR html LIKE :pattern', { pattern })
        .execute();

      pages += pageResult.affected ?? 0;
    }

    return { articles, pages, revisions };
  }

  private escapeSql(value: string): string {
    return value.replace(/'/g, "''");
  }
}
