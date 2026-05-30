import type { ReactNode } from 'react';

interface WidgetTitleProps {
  icon: ReactNode;
  children: ReactNode;
}

/** Sidebar card heading with a consistent line icon. */
export default function WidgetTitle({ icon, children }: WidgetTitleProps) {
  return (
    <h3 className="widget-title">
      <span className="widget-title-icon" aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </h3>
  );
}
