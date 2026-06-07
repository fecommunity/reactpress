import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export const RP_TOOLBAR_BTN_CLASS = 'rp-toolbar-btn';

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  lineHeight: 0,
  flexShrink: 0,
};

export interface ToolbarIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> {
  children: ReactNode;
  size?: number;
}

export function ToolbarIconButton({
  children,
  className,
  style,
  ...rest
}: ToolbarIconButtonProps) {
  return (
    <button
      type="button"
      className={[RP_TOOLBAR_BTN_CLASS, className].filter(Boolean).join(' ')}
      style={{ ...baseStyle, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
