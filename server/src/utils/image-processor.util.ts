import * as path from 'path';
import sharp = require('sharp');

export type ImageVariant = 'large' | 'medium' | 'thumb' | 'avatar';
export type ImageScene = 'default' | 'content' | 'cover' | 'avatar';

export interface ProcessedImageVariant {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

export interface ImageVariantMeta {
  url: string;
  filename: string;
  width: number;
  height: number;
  size: number;
}

const PROCESSABLE_MIMETYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

const IMAGE_VARIANT_CONFIG: Record<
  ImageVariant,
  { maxWidth: number; maxHeight?: number; quality: number; fit?: 'cover' | 'inside' }
> = {
  large: { maxWidth: 1920, quality: 82, fit: 'inside' },
  medium: { maxWidth: 1200, quality: 80, fit: 'inside' },
  thumb: { maxWidth: 400, quality: 75, fit: 'inside' },
  avatar: { maxWidth: 256, maxHeight: 256, quality: 80, fit: 'cover' },
};

export function isProcessableImage(mimetype: string): boolean {
  return PROCESSABLE_MIMETYPES.has(String(mimetype || '').toLowerCase());
}

export function variantsForScene(scene: ImageScene): ImageVariant[] {
  switch (scene) {
    case 'avatar':
      return ['avatar'];
    case 'content':
      return ['large', 'medium', 'thumb'];
    case 'cover':
      return ['large', 'medium', 'thumb'];
    default:
      return ['large', 'medium', 'thumb'];
  }
}

export function primaryVariantForScene(scene: ImageScene): ImageVariant {
  switch (scene) {
    case 'avatar':
      return 'avatar';
    case 'content':
      return 'medium';
    case 'cover':
      return 'large';
    default:
      return 'large';
  }
}

export function buildVariantFilename(baseFilename: string, variant: ImageVariant): string {
  const parsed = path.parse(baseFilename);
  const baseName = parsed.name.replace(/_(medium|thumb|avatar)$/i, '');

  if (variant === 'large') {
    return path.join(parsed.dir, `${baseName}.webp`);
  }

  return path.join(parsed.dir, `${baseName}_${variant}.webp`);
}

export function listVariantFilenames(baseFilename: string): string[] {
  return (['large', 'medium', 'thumb', 'avatar'] as ImageVariant[]).map((variant) =>
    buildVariantFilename(baseFilename, variant)
  );
}

export async function processImageBuffer(buffer: Buffer, variant: ImageVariant): Promise<ProcessedImageVariant> {
  const config = IMAGE_VARIANT_CONFIG[variant];
  let pipeline = sharp(buffer, { animated: false }).rotate();

  if (config.fit === 'cover' && config.maxHeight) {
    pipeline = pipeline.resize(config.maxWidth, config.maxHeight, {
      fit: 'cover',
      position: 'centre',
    });
  } else {
    pipeline = pipeline.resize(config.maxWidth, undefined, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const output = await pipeline.webp({ quality: config.quality, effort: 4 }).toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
    size: output.info.size,
  };
}

export async function processImageVariants(
  buffer: Buffer,
  variants: ImageVariant[]
): Promise<Map<ImageVariant, ProcessedImageVariant>> {
  const results = new Map<ImageVariant, ProcessedImageVariant>();

  for (const variant of variants) {
    results.set(variant, await processImageBuffer(buffer, variant));
  }

  return results;
}
