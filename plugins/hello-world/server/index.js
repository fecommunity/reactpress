'use strict';

/** @typedef {import('@fecommunity/reactpress-toolkit/plugin/server').HookService} HookService */
/** @typedef {import('@fecommunity/reactpress-toolkit/plugin/server').PluginContext} PluginContext */

/**
 * Hello World 示例插件。
 * - article.beforePublish：摘要为空时用标题生成摘要
 * - article.afterPublish：记录发布日志
 *
 * @param {HookService} hooks
 * @param {PluginContext} ctx
 */
function register(hooks, ctx) {
  hooks.addFilter(
    'article.beforePublish',
    async (article) => {
      const summary = article?.summary;
      if (summary && String(summary).trim()) {
        return article;
      }
      const title = String(article?.title || '').trim();
      return {
        ...article,
        summary: title ? `${title.slice(0, 160)} [hello-world]` : '[hello-world]',
      };
    },
    { priority: 10, pluginId: ctx.id },
  );

  hooks.addAction(
    'article.afterPublish',
    async (payload) => {
      const title = payload?.article?.title ?? '(untitled)';
      ctx.logger.log(`published article "${title}"`);
    },
    { pluginId: ctx.id },
  );
}

module.exports = { register };
