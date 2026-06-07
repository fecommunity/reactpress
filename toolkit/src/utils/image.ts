export type ImageVariant = 'large' | 'medium' | 'thumb' | 'avatar';

const VARIANT_SUFFIX: Record<Exclude<ImageVariant, 'large'>, string> = {
  medium: '_medium',
  thumb: '_thumb',
  avatar: '_avatar',
};

const WEBP_VARIANT_PATTERN = /^(.+?)(?:_(medium|thumb|avatar))?\.webp(\?.*)?$/i;

function extractWebpBase(url: string): string | null {
  const match = url.match(WEBP_VARIANT_PATTERN);
  if (!match) {
    return null;
  }

  return match[1];
}

/**
 * 根据展示场景解析图片 URL。
 * 上传后的 WebP 资源会按 `_medium` / `_thumb` / `_avatar` 后缀生成多尺寸版本；
 * 非 WebP 或无法识别的 URL 将原样返回，兼容历史数据。
 */
export function resolveImageUrl(url: string | null | undefined, variant: ImageVariant = 'medium'): string {
  if (!url) {
    return '';
  }

  const base = extractWebpBase(url);
  if (!base) {
    return url;
  }

  if (variant === 'large') {
    return `${base}.webp`;
  }

  return `${base}${VARIANT_SUFFIX[variant]}.webp`;
}
