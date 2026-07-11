import type { PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

import type { SummaryPluginConfig } from './types';

export const DEFAULT_CONFIG: SummaryPluginConfig = {
  enabled: true,
  maxLength: 160,
  suffix: '…',
  fallbackToTitle: true,
};

export function resolveConfig(ctx: PluginContext): SummaryPluginConfig {
  const patch = ctx.config as Partial<SummaryPluginConfig>;
  return {
    ...DEFAULT_CONFIG,
    ...patch,
  };
}
