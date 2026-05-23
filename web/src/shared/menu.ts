import type { AdminMenuItem } from "@fecommunity/reactpress-toolkit/admin";
import type { MenuItem } from "@/api/schemas";

/** Flatten legacy group nodes so the sidebar matches WordPress (no section headers). */
function flattenAdminGroups(nodes: AdminMenuItem[]): AdminMenuItem[] {
  const out: AdminMenuItem[] = [];
  for (const node of nodes) {
    if (node.kind === "group" && !node.path) {
      out.push(...flattenAdminGroups(node.children ?? []));
      continue;
    }
    out.push({
      ...node,
      children: node.children?.length ? flattenAdminGroups(node.children) : node.children,
    });
  }
  return out;
}

export function adminMenuToSidebar(nodes: AdminMenuItem[]): MenuItem[] {
  const flat = flattenAdminGroups(nodes);

  const walk = (list: AdminMenuItem[]): MenuItem[] =>
    list.map((node) => {
      if (node.kind === "group" || (node.children?.length && !node.path)) {
        return {
          id: node.id,
          kind: "group" as const,
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
        kind: "item" as const,
        name: node.title,
        path: node.path ?? "/",
        icon: node.icon ?? null,
        permissions: node.permissions ?? null,
        sort: node.sort ?? 0,
        hidden: node.hidden ?? false,
        children: node.children?.length ? walk(node.children) : null,
      };
    });

  return walk(flat);
}
