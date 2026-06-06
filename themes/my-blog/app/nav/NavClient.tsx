'use client';

import NavAdvanceSearch from '@/components/reactpress/NavAdvanceSearch';
import NavCardGrid from '@/components/reactpress/NavCardGrid';
import SystemNotification from '@/components/reactpress/SystemNotification';
import { useSiteCatalog } from '@fecommunity/reactpress-toolkit/theme';

interface NavClientProps {
  navConfig?: {
    urlConfig?: unknown[];
    searchCategories?: {
      categories?: Array<{ key: string; label: string }>;
      subCategories?: Record<string, Array<{ key: string; label: string; url?: string }>>;
    };
  };
}

export default function NavClient({ navConfig }: NavClientProps) {
  const { siteConfig } = useSiteCatalog();
  const searchCategories =
    navConfig?.searchCategories || siteConfig?.nav?.searchCategories;
  const urlConfig =
    (navConfig?.urlConfig || siteConfig?.nav?.urlConfig || []) as Parameters<
      typeof NavCardGrid
    >[0]['dataSource'];

  return (
    <div className="rp-nav-page pb-8">
      <SystemNotification />
      <NavAdvanceSearch searchCategories={searchCategories} />
      <NavCardGrid dataSource={urlConfig} />
    </div>
  );
}
