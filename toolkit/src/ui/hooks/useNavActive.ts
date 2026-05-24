import { useMemo } from 'react';
import { getNavActiveId } from '../../theme/nav';
import type { NavItem } from '../../theme/nav';

/**
 * Derive active nav id from pathname (pass `router.pathname` from `next/router` in client components).
 */
export function useNavActive(items: NavItem[], pathname: string): string | undefined {
  return useMemo(() => getNavActiveId(pathname, items), [pathname, items]);
}
