'use client';

import { useReportPageView } from '@fecommunity/reactpress-toolkit/ui';
import { type ReactNode } from 'react';

import BackToTop from '@/components/layout/BackToTop';

export function LayoutShell({ children }: { children: ReactNode }) {
  useReportPageView();

  return (
    <>
      {children}
      <BackToTop />
    </>
  );
}
