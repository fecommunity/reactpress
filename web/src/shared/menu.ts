import type { AdminMenuItem } from '@fecommunity/reactpress-toolkit/admin';
import type { MenuItem } from '@/api/schemas';

export function adminMenuToSidebar(nodes: AdminMenuItem[]): MenuItem[] {
  const walk = (list: AdminMenuItem[]): MenuItem[] =>
    list.map((node) => {
      if (node.kind === 'group' || (node.children?.length && !node.path)) {
        return {
          id: node.id,
          kind: 'group' as const,
          name: node.title,
          path: null,
          icon: node.icon ?? null,
          permissions: node.permissions ?? null,
          sort: node.sort ?? 0,
          hidden: node.hidden ?? false,
          children: walk(node.children ?? []),
        };
      }
      return {
        id: node.id,
        kind: 'item' as const,
        name: node.title,
        path: node.path ?? '/',
        icon: node.icon ?? null,
        permissions: node.permissions ?? null,
        sort: node.sort ?? 0,
        hidden: node.hidden ?? false,
        children: node.children?.length ? walk(node.children) : null,
      };
    });

  return walk(nodes);
}
