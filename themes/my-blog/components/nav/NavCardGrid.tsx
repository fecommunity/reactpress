'use client';

import NavCategoryMenu from '@/components/nav/NavCategoryMenu';
import { getNavIconByName } from '@/lib/utils/icons';
import { useState } from 'react';

interface NavChild {
  key: string;
  label: string;
  description?: string;
  url?: string;
  icon?: string;
}

interface NavGroup {
  key: string;
  label: string;
  icon?: string;
  children?: NavChild[];
}

interface NavCardGridProps {
  dataSource?: NavGroup[];
}

function getIconUrl(item: { icon?: string; url?: string }) {
  if (item?.icon?.trim()) return item.icon.trim();
  if (item?.url) return `${item.url.replace(/\/$/, '')}/favicon.ico`;
  return '';
}

function resolveNavHref(child: NavChild) {
  if (child.url?.startsWith('http')) return child.url;
  if (child.url) return child.url;
  return `/nav/${child.key}/`;
}

function NavAvatar({ child }: { child: NavChild }) {
  const [failed, setFailed] = useState(false);
  const src = getIconUrl(child);

  if (!src || failed) {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-second)] text-xs font-medium text-[var(--second-text-color)]">
        {child.label.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={child.label}
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      className="h-8 w-8 shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function NavGroupIcon({ icon }: { icon?: string }) {
  const Icon = getNavIconByName(icon);
  return (
    <span className="mr-2 inline-flex align-middle text-[var(--primary-color)]">
      <Icon size={16} />
    </span>
  );
}

function NavListItem({ child }: { child: NavChild }) {
  const href = resolveNavHref(child);
  const external = href.startsWith('http');

  const title = (
    <a
      href={href}
      rel="nofollow"
      target={external ? '_blank' : undefined}
      className="text-[15px] font-medium text-[var(--main-text-color)] no-underline hover:text-[var(--primary-color)]"
    >
      {child.label}
    </a>
  );

  return (
    <li className="m-0 min-w-0 p-0">
      <div className="rp-nav-list-item flex items-start gap-3 py-1">
        <NavAvatar child={child} />
        <div className="min-w-0 flex-1">
          <div className="leading-snug">{title}</div>
          {child.description ? (
            <p className="rp-nav-item-desc m-0 mt-1 text-sm text-[var(--second-text-color)]" title={child.description}>
              {child.description}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function NavCard({ group }: { group: NavGroup }) {
  return (
    <section className="rp-nav-card overflow-hidden rounded-lg bg-[var(--bg-box)] shadow-[var(--box-shadow)]">
      <header className="border-b border-[var(--border-color)] px-4 py-4 text-base font-semibold text-[var(--main-text-color)]">
        <span id={`nav-card-title-${group.key}`}>
          <NavGroupIcon icon={group.icon} />
          <span>{group.label}</span>
        </span>
      </header>
      <div className="px-4 py-4">
        <ul className="rp-nav-list-grid m-0 list-none p-0">
          {(group.children ?? []).map((child, index) => (
            <NavListItem key={child.key ?? index} child={child} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Matches twentytwentyfive NavCard: left anchor menu + vertically stacked category cards. */
export default function NavCardGrid({ dataSource = [] }: NavCardGridProps) {
  if (!dataSource.length) return null;

  return (
    <div className="rp-nav-card-wrapper relative flex justify-between">
      <NavCategoryMenu dataSource={dataSource} />
      <div className="rp-nav-card-list min-w-0 flex-1">
        {dataSource.map((group, index) => (
          <div key={group.key} className={index > 0 ? 'mt-4' : ''}>
            <NavCard group={group} />
          </div>
        ))}
      </div>
    </div>
  );
}
