import type { Permission } from './permissions';

export type MenuNodeKind = 'group' | 'item';

export interface AdminMenuItem {
  id: string;
  kind: MenuNodeKind;
  title: string;
  path: string | null;
  icon?: string | null;
  sort?: number;
  hidden?: boolean;
  permissions?: Permission[] | null;
  children?: AdminMenuItem[];
}

export interface MenuRegisterInput {
  id: string;
  title: string;
  path?: string | null;
  icon?: string | null;
  sort?: number;
  hidden?: boolean;
  permissions?: Permission[] | null;
  children?: MenuRegisterInput[];
}

export interface SettingsTabInput {
  id: string;
  title: string;
  path: string;
  permission?: Permission;
  sort?: number;
}

export interface RoutePermissionInput {
  path: string;
  permission: Permission | null;
}

export interface MenuRegistry {
  register(input: MenuRegisterInput): void;
  getTree(): AdminMenuItem[];
}

export interface SettingsRegistry {
  registerTab(input: SettingsTabInput): void;
  getTabs(): SettingsTabInput[];
}

export interface PermissionRegistry {
  register(perms: Permission[]): void;
  getAll(): Permission[];
}

export interface RouteRegistry {
  registerRoute(input: RoutePermissionInput): void;
  getRoutePermissions(): RoutePermissionInput[];
}

export interface AdminContext {
  menu: MenuRegistry;
  settings: SettingsRegistry;
  permissions: PermissionRegistry;
  routes: RouteRegistry;
}

export interface AdminModule {
  id: string;
  register(ctx: AdminContext): void;
}

function normalizeMenuInput(input: MenuRegisterInput): AdminMenuItem {
  const hasChildren = Boolean(input.children?.length);
  return {
    id: input.id,
    kind: hasChildren && !input.path ? 'group' : 'item',
    title: input.title,
    path: input.path ?? (hasChildren ? null : '/'),
    icon: input.icon ?? null,
    sort: input.sort ?? 0,
    hidden: input.hidden ?? false,
    permissions: input.permissions ?? null,
    children: input.children?.map(normalizeMenuInput),
  };
}

export function createAdminRegistry(): AdminContext {
  const menuItems: AdminMenuItem[] = [];
  const settingsTabs: SettingsTabInput[] = [];
  const permissions = new Set<Permission>();
  const routePermissions: RoutePermissionInput[] = [];

  const menu: MenuRegistry = {
    register(input) {
      menuItems.push(normalizeMenuInput(input));
    },
    getTree() {
      return [...menuItems].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    },
  };

  const settings: SettingsRegistry = {
    registerTab(input) {
      settingsTabs.push(input);
    },
    getTabs() {
      return [...settingsTabs].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    },
  };

  const permissionRegistry: PermissionRegistry = {
    register(perms) {
      for (const p of perms) permissions.add(p);
    },
    getAll() {
      return [...permissions];
    },
  };

  const routes: RouteRegistry = {
    registerRoute(input) {
      routePermissions.push(input);
    },
    getRoutePermissions() {
      return routePermissions;
    },
  };

  return { menu, settings, permissions: permissionRegistry, routes };
}

export function filterMenuByPermissions(
  nodes: AdminMenuItem[],
  granted: Set<string>,
): AdminMenuItem[] {
  const can = (required: Permission[] | null | undefined) => {
    if (!required?.length) return true;
    return required.every((p) => granted.has(p));
  };

  const walk = (list: AdminMenuItem[]): AdminMenuItem[] =>
    list
      .map((node) => {
        if (!can(node.permissions)) return null;
        if (node.children?.length) {
          const children = walk(node.children);
          if (children.length === 0) return null;
          return { ...node, children };
        }
        return node;
      })
      .filter((n): n is AdminMenuItem => n != null);

  return walk(nodes);
}
