import {
  createAdminRegistry,
  filterMenuByPermissions,
  type AdminContext,
  type AdminMenuItem,
} from "@fecommunity/reactpress-toolkit/admin";
import { articleModule } from "@/modules/article";
import { commentModule } from "@/modules/comment";
import { dashboardModule } from "@/modules/dashboard";
import { dataModule } from "@/modules/data";
import { appearanceModule } from "@/modules/appearance";
import { mediaModule } from "@/modules/media";
import { pageModule } from "@/modules/page";
import { pluginsModule } from "@/modules/plugins";
import { settingsModule } from "@/modules/settings";
import { userModule } from "@/modules/user";

const CORE_MODULES = [
  dashboardModule,
  articleModule,
  commentModule,
  mediaModule,
  pageModule,
  appearanceModule,
  pluginsModule,
  userModule,
  settingsModule,
  dataModule,
];

let adminContext: AdminContext | null = null;

export function bootstrapAdmin(): AdminContext {
  if (adminContext) return adminContext;

  const ctx = createAdminRegistry();
  for (const mod of CORE_MODULES) {
    mod.register(ctx);
  }
  adminContext = ctx;
  return ctx;
}

export function getAdminContext(): AdminContext {
  return bootstrapAdmin();
}

export function getMenuTreeForPermissions(permissionList: string[]): AdminMenuItem[] {
  const ctx = bootstrapAdmin();
  const granted = new Set(permissionList);
  return filterMenuByPermissions(ctx.menu.getTree(), granted);
}

export function getSettingsTabs() {
  return bootstrapAdmin().settings.getTabs();
}

export function getRoutePermissionMap(): Record<string, string | null> {
  const map: Record<string, string | null> = {};
  for (const entry of bootstrapAdmin().routes.getRoutePermissions()) {
    map[entry.path] = entry.permission;
  }
  return map;
}
