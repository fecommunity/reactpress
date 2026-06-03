import cls from 'classnames';
import type { ReactNode } from 'react';

import s from './ui.module.scss';

export function Tag({
  children,
  color,
  className,
  icon,
}: {
  children?: ReactNode;
  color?: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span className={cls(s.tag, className)} style={color ? { backgroundColor: color } : undefined}>
      {icon}
      {children}
    </span>
  );
}
