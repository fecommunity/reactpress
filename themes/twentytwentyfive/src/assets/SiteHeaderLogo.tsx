import cls from 'classnames';

import { REACT_PRESS_HEADER_LOGO } from './brand';
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
  return (
    <img
      src={src}
      alt="ReactPress"
      className={cls(markStyles.mark, markStyles.wordmark, markStyles.headerBar, className)}
      decoding="async"
    />
  );
}
