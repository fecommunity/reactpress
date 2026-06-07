import { useMemo } from 'react';

import type { NavItem } from '../../theme/content/nav';
import { getNavActiveId } from '../../theme/content/nav';

/**
 * Derive active nav id from pathname (pass `router.pathname` from `next/router` in client components).
 */
export function useNavActive(items: NavItem[], pathname: string): string | undefined {
  return useMemo(() => getNavActiveId(pathname, items), [pathname, items]);
}
