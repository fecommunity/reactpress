'use client';

import SiteFooter from '@/components/layout/SiteFooter';
import { usePathname } from 'next/navigation';

/** List/archive pages use sidebar AboutUs — same as demo `needLayoutFooter: false`. */
function shouldHideSiteFooter(pathname: string): boolean {
  const path = (pathname || '/').replace(/\/$/, '') || '/';
  if (path === '/') return true;
  if (path.startsWith('/category/')) return true;
  if (path.startsWith('/tag/')) return true;
  if (path === '/search') return true;
  if (path === '/archives') return true;
  if (path === '/tags') return true;
  if (path === '/suggestions') return true;
  return false;
}

export default function ConditionalSiteFooter() {
  const pathname = usePathname() ?? '/';
  if (shouldHideSiteFooter(pathname)) return null;
  return <SiteFooter />;
}
