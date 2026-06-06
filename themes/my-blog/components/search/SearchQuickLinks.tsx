'use client';

import Link from '@/components/shared/Link';
import { getNavIconByName } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

interface SearchQuickLinksProps {
  dataSource?: NavGroup[];
}

function getIconUrl(item: { icon?: string; url?: string }) {
  if (item?.icon?.trim()) return item.icon.trim();
  if (item?.url) return `${item.url.replace(/\/$/, '')}/favicon.ico`;
  return '';
}

function plainDescription(value?: string) {
  if (!value?.trim()) return '';
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sectionId(key: string) {
  return `rp-nav-portal-${key}`;
}

function getScrollOffset(tabsHeight: number) {
  const headerOffset = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--rp-header-offset') || '0',
  );
  return headerOffset + tabsHeight + 12;
}

function SiteIcon({ child }: { child: NavChild }) {
  const [failed, setFailed] = useState(false);
  const src = getIconUrl(child);

  if (!src || failed) {
    return (
      <span className="rp-nav-portal__site-fallback" aria-hidden>
        {child.label.slice(0, 1)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={36}
      height={36}
      loading="lazy"
      decoding="async"
      className="rp-nav-portal__site-img"
      onError={() => setFailed(true)}
    />
  );
}

function SiteTile({ child }: { child: NavChild }) {
  const tip = plainDescription(child.description) || child.label;

  return (
    <li className="rp-nav-portal__site-item">
      <Link href={`/nav/${child.key}/`} title={tip} className="rp-nav-portal__site">
        <span className="rp-nav-portal__site-icon">
          <SiteIcon child={child} />
        </span>
        <span className="rp-nav-portal__site-name">{child.label}</span>
      </Link>
    </li>
  );
}

export default function SearchQuickLinks({ dataSource = [] }: SearchQuickLinksProps) {
  const { t } = useLocale();
  const groups = useMemo(() => dataSource.filter((group) => (group.children?.length ?? 0) > 0), [dataSource]);
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? '');
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const scrollingRef = useRef(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const scrollToGroup = useCallback((key: string) => {
    const section = document.getElementById(sectionId(key));
    if (!section) return;

    setActiveKey(key);
    setFlashKey(key);
    scrollingRef.current = true;

    const tabsHeight = tabsRef.current?.offsetHeight ?? 0;
    const top = section.getBoundingClientRect().top + window.scrollY - getScrollOffset(tabsHeight);
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    tabRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    window.setTimeout(() => {
      scrollingRef.current = false;
    }, 700);
    window.setTimeout(() => {
      setFlashKey((current) => (current === key ? null : current));
    }, 900);
  }, []);

  useEffect(() => {
    if (groups.length <= 1) return undefined;

    const sections = groups
      .map((group) => document.getElementById(sectionId(group.key)))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollingRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const key = visible.target.id.replace('rp-nav-portal-', '');
        setActiveKey(key);
        tabRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      },
      {
        rootMargin: '-18% 0px -52% 0px',
        threshold: [0, 0.2, 0.45],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [groups]);

  if (!groups.length) return null;

  const showTabs = groups.length > 1;

  return (
    <section className="rp-nav-portal rp-page-enter-delayed" aria-label={t('nav')}>
      <div className="rp-nav-portal__card">
        {showTabs ? (
          <div ref={tabsRef} className="rp-nav-portal__tabs-wrap">
            <nav className="rp-nav-portal__tabs-track" aria-label={t('nav')}>
              {groups.map((group) => {
                const Icon = getNavIconByName(group.icon);
                const isActive = activeKey === group.key;
                return (
                  <button
                    key={group.key}
                    ref={(node) => {
                      tabRefs.current[group.key] = node;
                    }}
                    type="button"
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => scrollToGroup(group.key)}
                    className={`rp-nav-portal__tab ${isActive ? 'is-active' : ''}`}
                  >
                    <Icon size={14} className="rp-nav-portal__tab-icon" />
                    <span className="rp-nav-portal__tab-label">{group.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ) : null}

        <div className="rp-nav-portal__body">
          {groups.map((group, index) => {
            const Icon = getNavIconByName(group.icon);
            const isFlashing = flashKey === group.key;
            return (
              <section
                key={group.key}
                id={sectionId(group.key)}
                className={[
                  'rp-nav-portal__section',
                  index > 0 ? 'rp-nav-portal__section--gap' : '',
                  activeKey === group.key && showTabs ? 'is-active' : '',
                  isFlashing ? 'is-flash' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {!showTabs ? (
                  <header className="rp-nav-portal__section-head">
                    <Icon size={16} className="rp-nav-portal__section-icon" />
                    <h3 className="rp-nav-portal__section-title">{group.label}</h3>
                    <span className="rp-nav-portal__section-count">{(group.children ?? []).length}</span>
                  </header>
                ) : (
                  <h3 className="sr-only">{group.label}</h3>
                )}
                <ul className="rp-nav-portal__grid">
                  {(group.children ?? []).map((child, childIndex) => (
                    <SiteTile key={child.key ?? childIndex} child={child} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
