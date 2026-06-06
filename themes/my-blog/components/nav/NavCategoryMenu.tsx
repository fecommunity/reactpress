'use client';

import { getNavIconByName, MenuFoldIcon, MenuUnfoldIcon } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useMemo, useState } from 'react';

interface NavCategoryItem {
  key: string;
  label: string;
  icon?: string;
}

interface NavCategoryMenuProps {
  dataSource: NavCategoryItem[];
}

export default function NavCategoryMenu({ dataSource = [] }: NavCategoryMenuProps) {
  const { t } = useLocale();
  const [collapsed, setCollapsed] = useState(true);

  const items = useMemo(
    () =>
      dataSource.map((item) => ({
        ...item,
        Icon: getNavIconByName(item.icon),
      })),
    [dataSource],
  );

  const scrollToGroup = (key: string) => {
    document.getElementById(`nav-card-title-${key}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <div className="rp-nav-menu-wrapper relative mr-4 hidden shrink-0 md:flex">
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? t('navExpandMenu') : t('navCollapseMenu')}
        className="absolute top-3 left-4 z-10 border-0 bg-transparent p-0 text-[var(--main-text-color)] shadow-none hover:text-[var(--primary-color)]"
        style={{ left: collapsed ? 16 : 4 }}
      >
        {collapsed ? <MenuUnfoldIcon size={18} /> : <MenuFoldIcon size={18} />}
      </button>

      <nav
        className={`rp-nav-menu overflow-hidden rounded-lg bg-[var(--bg-box)] pt-11 shadow-[var(--box-shadow)] transition-[width] duration-200 ${
          collapsed ? 'w-14' : 'w-40'
        }`}
        aria-label={t('navCategoryMenu')}
      >
        <ul className="m-0 list-none p-2">
          {items.map((item) => (
            <li key={item.key} className="m-0 p-0">
              <button
                type="button"
                onClick={() => scrollToGroup(item.key)}
                title={item.label}
                className={`flex w-full items-center gap-2 rounded-md border-0 bg-transparent px-2 py-2.5 text-left text-sm text-[var(--main-text-color)] transition-colors hover:bg-[var(--bg-second)] hover:text-[var(--primary-color)] ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <span className="inline-flex shrink-0 text-[var(--primary-color)]">
                  <item.Icon size={16} />
                </span>
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
