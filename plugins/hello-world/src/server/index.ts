import type { HookService, PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

import { resolveConfig } from './config';
import { applyAutoSummary } from './summary';
import type { ArticleDraft } from './types';

/**
 * hello-world：自动摘要插件。
 * 发布前若 summary 为空，从 Markdown 正文（或标题）生成摘要。
 */
export function register(hooks: HookService, ctx: PluginContext): void {
  const config = () => resolveConfig(ctx);

  hooks.addFilter<ArticleDraft>('article.beforePublish', async (article) => applyAutoSummary(article, config()), {
    priority: 10,
    pluginId: ctx.id,
  });

  ctx.logger.log(`registered (enabled=${config().enabled}, maxLength=${config().maxLength})`);
}

export default { register };
