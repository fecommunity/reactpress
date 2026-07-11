import type { HookService, PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

import { resolveConfig } from './config';

/**
 * 图片资源优化：批量压缩历史素材由 Core FileOptimizationService 执行；
 * 本插件负责注册与配置，管理端仪表盘见 admin/OptimizeDashboard。
 */
export function register(_hooks: HookService, ctx: PluginContext): void {
  const config = resolveConfig(ctx);
  ctx.logger.log(
    `registered (batchSize=${config.batchSize}, skipGif=${config.skipGif}, rewriteContent=${config.rewriteContent})`,
  );
}

export default { register };
