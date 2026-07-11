import type { HookService, PluginContext } from '@fecommunity/reactpress-toolkit/plugin/server';

import { resolveConfig } from './config';
import { applySeoDefaults } from './seo';
import type { ArticleDraft } from './types';

/**
 * SEO 增强：文章别名（slug）、关键词、meta 描述。
 * 创建/发布前若字段为空，按插件配置自动补全。
 */
export function register(hooks: HookService, ctx: PluginContext): void {
  const config = () => resolveConfig(ctx);

  const handler = async (article: ArticleDraft) => applySeoDefaults(article, config());

  hooks.addFilter<ArticleDraft>('article.beforeCreate', handler, {
    priority: 20,
    pluginId: ctx.id,
  });

  hooks.addFilter<ArticleDraft>('article.beforePublish', handler, {
    priority: 20,
    pluginId: ctx.id,
  });

  ctx.logger.log(
    `registered (enabled=${config().enabled}, autoSlug=${config().autoSlug}, autoDescription=${config().autoDescription})`,
  );
}

export default { register };
