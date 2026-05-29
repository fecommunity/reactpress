import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  pressed?: boolean;
}

/** Accessible icon-only control for header toolbar. */
export default function IconButton({
  label,
  children,
  pressed,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={`rp-toolbar-btn ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
