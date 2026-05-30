const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pageFileToRoute, collectWarmupRoutes } = require('../lib/theme-warmup');
const { createMonorepoFixture, rmDir } = require('./helpers/tmp-project');

describe('lib/theme-warmup', () => {
  it('maps template files to warmup routes', () => {
    assert.equal(pageFileToRoute('pages/index.tsx'), '/');
    assert.equal(pageFileToRoute('pages/about.tsx'), '/about');
    assert.equal(pageFileToRoute('pages/tag/[tag].tsx'), '/tag/__reactpress_dev_warmup__');
    assert.equal(pageFileToRoute('pages/category/[category].tsx'), '/category/__reactpress_dev_warmup__');
    assert.equal(pageFileToRoute('pages/article/[id].tsx'), '/article/__reactpress_dev_warmup__');
  });

  it('collects routes from theme.json templates', () => {
    const root = createMonorepoFixture();
    try {
      const themeDir = path.join(root, 'themes', 'demo-theme');
      const pagesDir = path.join(themeDir, 'pages');
      require('fs').mkdirSync(path.join(pagesDir, 'tag'), { recursive: true });
      require('fs').writeFileSync(
        path.join(themeDir, 'theme.json'),
        JSON.stringify({
          id: 'demo-theme',
          reactpress: {
            templates: {
              home: 'pages/index.tsx',
              'archive-tag': 'pages/tag/[tag].tsx',
              search: 'pages/search.tsx',
            },
          },
        }),
      );
      require('fs').writeFileSync(path.join(pagesDir, 'index.tsx'), '');
      require('fs').writeFileSync(path.join(pagesDir, 'search.tsx'), '');
      require('fs').writeFileSync(path.join(pagesDir, 'tag', '[tag].tsx'), '');

      const routes = collectWarmupRoutes(themeDir);
      assert.ok(routes.includes('/'));
      assert.ok(routes.includes('/search'));
      assert.ok(routes.includes('/tag/__reactpress_dev_warmup__'));
      assert.ok(routes.includes('/404'));
    } finally {
      rmDir(root);
    }
  });
});
