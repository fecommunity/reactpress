import { NextPage } from 'next';

import { ArticleProvider } from '@/providers/article';
import { CategoryProvider } from '@/providers/category';
import { SettingProvider } from '@/providers/setting';
import RSS from '@/rss/index.js';
const url = require('url');

const Rss: NextPage = () => {
  return null;
};

// 服务端预取数据
Rss.getInitialProps = async (ctx) => {
  const { res } = ctx;
  res.setHeader('Content-Type', 'text/xml');

  const [[articles], setting, categories] = await Promise.all([
    ArticleProvider.getArticles({
      page: 1,
      pageSize: 99999,
      status: 'publish',
    }),
    SettingProvider.getSetting(),
    CategoryProvider.getCategory({ articleStatus: 'publish' }),
  ]);

  const feed = new RSS(
    {
      title: setting.systemTitle,
      description: setting.seoDesc,
      feed_url: url.resolve(setting.systemUrl, 'rss'),
      site_url: setting.systemUrl,
      author: 'https://github.com/fecommunity',
      categories: categories.map((c) => c.label),
    },
    null
  );

  articles.forEach((article) => {
    feed.item({
      title: article.title,
      description: article.html || article.content,
      url: url.resolve(setting.systemUrl, 'article/' + article.id),
      date: article.publishAt,
      categories: [(article.category || {}).label],
    });
  });

  // @ts-ignore
  res.write(feed.xml());
  res.end();
};

export default Rss;
