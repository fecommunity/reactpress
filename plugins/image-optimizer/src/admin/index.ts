import type { PluginAdminModule } from '@fecommunity/reactpress-toolkit/plugin/admin';

export { SettingsPanel } from './OptimizeDashboard';

import { SettingsPanel } from './OptimizeDashboard';

export function registerAdmin(): void {
  // Dashboard is mounted via SettingsPanel on the plugin settings page.
}

const pluginAdmin: PluginAdminModule = {
  registerAdmin,
  SettingsPanel,
};

export default pluginAdmin;
