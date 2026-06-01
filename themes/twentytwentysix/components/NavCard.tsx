export interface NavLinkItem {
  key?: string;
  label?: string;
  title?: string;
  name?: string;
  url?: string;
  href?: string;
  description?: string;
  icon?: string;
}

export interface NavCardGroup {
  key?: string;
  title?: string;
  name?: string;
  label?: string;
  links?: NavLinkItem[];
  items?: NavLinkItem[];
  children?: NavLinkItem[];
}

interface NavCardProps {
  groups?: NavCardGroup[];
}

function groupTitle(group: NavCardGroup, index: number): string {
  return group.label || group.title || group.name || `Group ${index + 1}`;
}

function groupLinks(group: NavCardGroup): NavLinkItem[] {
  return group.children || group.links || group.items || [];
}

function linkLabel(link: NavLinkItem): string {
  return link.label || link.title || link.name || link.url || link.href || '';
}

export default function NavCard({ groups = [] }: NavCardProps) {
  if (!groups.length) {
    return (
      <p className="text-sm text-muted-foreground">
        在后台「外观 → 自定义 → 顶栏与网址导航」中配置导航卡片。
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group, groupIndex) => {
        const title = groupTitle(group, groupIndex);
        const links = groupLinks(group);
        return (
          <section key={group.key || title + groupIndex}>
            <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {links.map((link, linkIndex) => {
                const href = link.url || link.href;
                const label = linkLabel(link);
                if (!href) return null;
                return (
                  <li key={link.key || label + linkIndex}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-surface block no-underline transition-shadow hover:shadow-md"
                    >
                      <span className="font-medium text-foreground">{label}</span>
                      {link.description ? (
                        <span className="mt-1 block text-xs text-muted-foreground">{link.description}</span>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
