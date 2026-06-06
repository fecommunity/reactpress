'use client';

import { useReportPageView } from '@fecommunity/reactpress-toolkit/ui';
import { type ReactNode } from 'react';

import BackToTop from '@/components/layout/BackToTop';
import PageLoadProgress from '@/components/layout/PageLoadProgress';

export function LayoutShell({ children }: { children: ReactNode }) {
  useReportPageView();

  return (
    <>
      <PageLoadProgress />
      {children}
      <BackToTop />
    </>
  );
}
