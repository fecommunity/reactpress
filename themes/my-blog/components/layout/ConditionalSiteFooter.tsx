'use client';

import SiteFooter from '@/components/layout/SiteFooter';
import { useHomeFooter } from '@/lib/reactpress/homeFooter';
import { usePathname } from 'next/navigation';

function isFeedLikePage(pathname: string): boolean {
  const path = (pathname || '/').replace(/\/$/, '') || '/';
  if (path === '/') return true;
  if (path.startsWith('/category/')) return true;
  if (path.startsWith('/tag/')) return true;
  if (path === '/search') return true;
  if (path === '/archives') return true;
  if (path === '/tags') return true;
  return false;
}

function shouldHideSiteFooter(pathname: string, showLayoutFooter: boolean): boolean {
  if (!isFeedLikePage(pathname)) return false;
  return !showLayoutFooter;
}

export default function ConditionalSiteFooter() {
  const pathname = usePathname() ?? '/';
  const { showLayoutFooter } = useHomeFooter();

  if (shouldHideSiteFooter(pathname, showLayoutFooter)) return null;
  return <SiteFooter />;
}
