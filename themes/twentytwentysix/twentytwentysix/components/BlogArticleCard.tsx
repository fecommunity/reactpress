import Link from 'next/link';
import {
  ArticleCard,
  formatPublishDate,
  type ArticleCardArticle,
} from '@fecommunity/reactpress-toolkit/theme';

interface BlogArticleCardProps {
  article: ArticleCardArticle;
  titleTag?: 'h2' | 'h3';
  showCategory?: boolean;
}

export default function BlogArticleCard({
  article,
  titleTag = 'h3',
  showCategory = true,
}: BlogArticleCardProps) {
  return (
    <ArticleCard
      article={article}
      className="article-card"
      titleTag={titleTag}
      showCategory={showCategory}
      renderTitleLink={({ href, children }) => <Link href={href}>{children}</Link>}
      renderCategoryLink={({ href, children }) => <Link href={href}>{children}</Link>}
      renderDate={(publishAt) => formatPublishDate(publishAt)}
    />
  );
}
