import cls from 'classnames';

import {
  REACT_PRESS_LIST_PLACEHOLDER,
  REACT_PRESS_WORDMARK_ASPECT,
  wordmarkWidthAtHeight,
} from './brand';
import markStyles from './logoMark.module.scss';

/** Default cover / OG fallback — horizontal wordmark PNG. */
export const REACT_PRESS_LOGO_SRC = REACT_PRESS_LIST_PLACEHOLDER.src;

/** @deprecated Use `REACT_PRESS_WORDMARK_ASPECT`. */
export const REACT_PRESS_LOGO_ASPECT = REACT_PRESS_WORDMARK_ASPECT;

/** @deprecated Use `REACT_PRESS_LOGO_SRC`. */
export const defaultImgSrc = REACT_PRESS_LOGO_SRC;

type LogoSvgProps = {
  height?: number;
  className?: string;
};

/** Article list placeholder — `public/logo.png` with list sizing from `brand.ts`. */
export default function LogoSvg({
  height = REACT_PRESS_LIST_PLACEHOLDER.displayHeight,
  className,
}: LogoSvgProps) {
  const width = wordmarkWidthAtHeight(height);

  return (
    <img
      src={REACT_PRESS_LIST_PLACEHOLDER.src}
      width={width}
      height={height}
      alt="ReactPress"
      className={cls(markStyles.mark, markStyles.wordmark, className)}
      decoding="async"
    />
  );
}
