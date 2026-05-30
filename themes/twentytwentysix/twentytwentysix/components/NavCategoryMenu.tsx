import type { UrlNavCategory } from '../lib/fetch';

interface NavCategoryMenuProps {
  items: UrlNavCategory[];
}

/** Anchor menu for nav groups — matches client NavCard/Category. */
export default function NavCategoryMenu({ items }: NavCategoryMenuProps) {
  const groups = items.filter((item) => item.children?.length);

  if (!groups.length) return null;

  return (
    <nav className="nav-category-menu" aria-label="导航分类">
      <ul>
        {groups.map((group) => (
          <li key={group.key || group.label}>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById(`nav-group-${group.key || group.label}`)
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {group.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
