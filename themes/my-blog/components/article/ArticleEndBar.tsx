'use client';

import BookmarkWidget from '@/components/widgets/BookmarkWidget';
import LikesWidget from '@/components/widgets/LikesWidget';

interface ArticleEndBarProps {
  articleId: string;
  likes: number;
  likesApi: (id: string, type: 'like' | 'dislike') => Promise<number>;
}

export default function ArticleEndBar({ articleId, likes, likesApi }: ArticleEndBarProps) {
  return (
    <div className="rp-article-end-bar">
      <LikesWidget defaultCount={likes} id={articleId} api={likesApi} variant="inline" />
      <BookmarkWidget id={articleId} variant="inline" />
    </div>
  );
}
