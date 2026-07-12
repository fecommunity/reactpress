import type { PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

export interface ImageOptimizerConfig {
  batchSize: number;
  skipGif: boolean;
  rewriteContent: boolean;
  cleanupOriginals: boolean;
}

export function resolveConfig(ctx: PluginContext): ImageOptimizerConfig {
  const raw = ctx.config ?? {};
  const batchSize = Number(raw.batchSize);
  return {
    batchSize: Number.isFinite(batchSize) ? Math.min(Math.max(batchSize, 1), 200) : 50,
    skipGif: raw.skipGif !== false,
    rewriteContent: raw.rewriteContent === true,
    cleanupOriginals: raw.cleanupOriginals === true,
  };
}
