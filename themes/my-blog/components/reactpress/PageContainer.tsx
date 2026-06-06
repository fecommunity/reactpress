import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/** Content width aligned with twentytwentyfive `.container` breakpoints. */
export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`rp-container mx-auto w-full px-4 ${className}`}>
      {children}
    </div>
  );
}
