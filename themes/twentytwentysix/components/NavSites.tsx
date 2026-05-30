import Link from 'next/link';
import type { UrlNavCategory } from '../lib/fetch';

interface NavSitesProps {
  items: UrlNavCategory[];
}

function siteIcon(item: UrlNavCategory) {
  if (item.url && /^https?:\/\//.test(item.url)) {
    try {
      return `${new URL(item.url).origin}/favicon.ico`;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function NavLinkCard({ item }: { item: UrlNavCategory }) {
  const icon = siteIcon(item);
  const previewHref = item.key ? `/nav/${item.key}` : null;
  const external = item.url?.startsWith('http');

  const body = (
    <>
      {icon ? <img src={icon} alt="" width={32} height={32} /> : <span aria-hidden>🌐</span>}
      <div>
        <strong>{item.label}</strong>
        {item.description ? <small>{item.description}</small> : null}
      </div>
    </>
  );

  if (previewHref) {
    return (
      <Link href={previewHref} className="nav-site-card">
        {body}
      </Link>
    );
  }

  if (external && item.url) {
    return (
      <a href={item.url} className="nav-site-card" target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <span className="nav-site-card nav-site-card--static">
      {body}
    </span>
  );
}

function NavGroup({ item }: { item: UrlNavCategory }) {
  if (item.children?.length) {
    return (
      <section
        className="nav-site-group"
        id={`nav-group-${item.key || item.label}`}
      >
        <h3>{item.label}</h3>
        {item.description ? <p className="nav-site-desc">{item.description}</p> : null}
        <div className="nav-site-grid">
          {item.children.map((child) => (
            <NavLinkCard key={child.key || child.label} item={child} />
          ))}
        </div>
      </section>
    );
  }

  if (item.url || item.key) {
    return (
      <section className="nav-site-group">
        <div className="nav-site-grid">
          <NavLinkCard item={item} />
        </div>
      </section>
    );
  }

  return null;
}

/** URL directory cards — migrated from client NavCard. */
export default function NavSites({ items }: NavSitesProps) {
  if (!items.length) {
    return <p className="empty-state">尚未在全局设置中配置导航站点。</p>;
  }

  return (
    <div className="nav-sites">
      {items.map((item) => (
        <NavGroup key={item.key || item.label} item={item} />
      ))}
    </div>
  );
}
