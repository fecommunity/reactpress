import cls from 'classnames';

import { REACT_PRESS_HEADER_LOGO, wordmarkWidthAtHeight } from './brand';
import markStyles from './logoMark.module.scss';

type SiteHeaderLogoProps = {
  src?: string;
  className?: string;
};

/** Header wordmark — defaults to `public/logo.png`, fills header bar height. */
export default function SiteHeaderLogo({
  src = REACT_PRESS_HEADER_LOGO.src,
  className,
}: SiteHeaderLogoProps) {
  const height = REACT_PRESS_HEADER_LOGO.displayHeight;
  const width = wordmarkWidthAtHeight(height);

  return (
    <img
      src={src}
      alt="ReactPress"
      width={width}
      height={height}
      className={cls(markStyles.mark, markStyles.wordmark, markStyles.headerBar, className)}
      decoding="sync"
      fetchpriority="high"
    />
  );
}
