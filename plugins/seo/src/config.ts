import type { PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

import type { SeoPluginConfig } from './types';

export const DEFAULT_CONFIG: SeoPluginConfig = {
  enabled: true,
  autoSlug: true,
  autoDescription: true,
  autoKeywords: true,
  descriptionMaxLength: 160,
  descriptionSuffix: '…',
};

export function resolveConfig(ctx: PluginContext): SeoPluginConfig {
  const patch = ctx.config as Partial<SeoPluginConfig>;
  return {
    ...DEFAULT_CONFIG,
    ...patch,
  };
}
