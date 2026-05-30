import { GetServerSideProps } from 'next';
import { buildRssXml, fetchRssFeedData, themeApi } from '../../lib/fetch';

/** RSS feed — migrated from client `/rss`. */
export default function RssPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const data = await fetchRssFeedData(themeApi);
    const xml = buildRssXml({
      title: data.title,
      description: data.description,
      siteUrl: data.siteUrl,
      feedUrl: data.feedUrl,
      articles: data.articles as never,
    });
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('[twentytwentysix] RSS generation failed', error);
    res.statusCode = 500;
    res.end('RSS unavailable');
  }
  return { props: {} };
};
