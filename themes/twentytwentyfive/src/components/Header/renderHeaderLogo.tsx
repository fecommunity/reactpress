import SiteHeaderLogo from '@/assets/SiteHeaderLogo';
import markStyles from '@/assets/logoMark.module.scss';
import {
  REACT_PRESS_HEADER_LOGO,
  REACT_PRESS_ICON_LOGO,
} from '@/assets/brand';

const IMAGE_SRC_RE = /\.(svg|png|jpe?g|gif|webp|avif)(\?.*)?$/i;

function isHttpLogo(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isImageSrc(value: string): boolean {
  return value.startsWith('/') || value.startsWith('./') || IMAGE_SRC_RE.test(value);
}

type RenderHeaderLogoOptions = {
  systemLogo?: string;
  height?: number;
};

function headerImage(src: string, height: number, useWordmarkSizing: boolean) {
  return (
    <img
      src={src}
      alt="logo"
      className={useWordmarkSizing ? markStyles.headerBar : undefined}
      style={{
        width: 'auto',
        height: useWordmarkSizing ? '100%' : height,
        objectFit: 'contain',
      }}
    />
  );
}

/** Renders site logo for the theme header (wordmark PNG by default). */
export function renderHeaderLogo({
  systemLogo,
  height = REACT_PRESS_HEADER_LOGO.displayHeight,
}: RenderHeaderLogoOptions) {
  const raw = systemLogo?.trim() ?? '';

  if (!raw) {
    return <SiteHeaderLogo height={height} />;
  }

  if (isHttpLogo(raw) || isImageSrc(raw)) {
    const isWordmark =
      raw.endsWith('.png') ||
      raw.includes('logo.png') ||
      raw === REACT_PRESS_HEADER_LOGO.src;
    return headerImage(raw, height, isWordmark);
  }

  if (raw.includes('<')) {
    return <span dangerouslySetInnerHTML={{ __html: raw }} />;
  }

  return <SiteHeaderLogo height={height} />;
}

export { REACT_PRESS_HEADER_LOGO, REACT_PRESS_ICON_LOGO };
