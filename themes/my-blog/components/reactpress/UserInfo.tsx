'use client';

import { FlameIcon } from '@/src/utils/icons';
import { useSiteUser } from '@fecommunity/reactpress-toolkit/theme';

function resolveAdminHref(): string {
  const configured = process.env.NEXT_PUBLIC_REACTPRESS_ADMIN_URL?.trim();
  if (configured) {
    return configured.endsWith('/') ? configured : `${configured}/`;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/admin/`;
  }
  return 'http://localhost/admin/';
}

export default function UserInfo() {
  const { user } = useSiteUser();

  if (user?.name) {
    return (
      <a
        href={resolveAdminHref()}
        aria-label={user.name}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-color)] text-sm font-medium text-white no-underline"
      >
        {user.name.slice(0, 1).toUpperCase()}
      </a>
    );
  }

  return (
    <a
      href={resolveAdminHref()}
      aria-label="Hot"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--main-text-color)] no-underline transition-colors hover:bg-[var(--bg-second)] hover:text-[var(--primary-color)]"
    >
      <FlameIcon size={20} />
    </a>
  );
}
