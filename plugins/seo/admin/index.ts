import {
  AdminSlotIds,
  type PluginAdminModule,
  type PluginAdminRegistry,
  type PluginAdminContext,
} from "@fecommunity/reactpress-toolkit/plugin/admin";

import { ArticleEditorSeoPanel } from "./ArticleEditorSeoPanel";

export function registerAdmin(registry: PluginAdminRegistry, _ctx: PluginAdminContext): void {
  registry.registerSlot(AdminSlotIds.ARTICLE_EDITOR_META_AFTER_SUMMARY, ArticleEditorSeoPanel, {
    priority: 10,
  });
}

const pluginAdmin: PluginAdminModule = { registerAdmin };

export default pluginAdmin;
