import type { ImgHTMLAttributes } from 'react';

import type { ImageVariant } from '../../../utils/image';
import { resolveImageUrl } from '../../../utils/image';

export type { ImageVariant };

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  url?: string | null;
  size?: ImageVariant;
}

/** 按上传变体尺寸渲染 `<img>`，`url` + `size` 外其余属性透传。 */
export function Image({ url, size = 'medium', alt = '', ...rest }: ImageProps) {
  const src = resolveImageUrl(url, size);
  if (!src) {
    return null;
  }

  return <img src={src} alt={alt} {...rest} />;
}
