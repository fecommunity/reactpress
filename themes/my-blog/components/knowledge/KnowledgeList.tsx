'use client';

import Link from '@/components/shared/Link';
import { EyeIcon } from '@/lib/utils/icons';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { Image, LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import type { IKnowledge } from '@fecommunity/reactpress-toolkit/types';

interface KnowledgeListProps {
  knowledges?: Array<IKnowledge & { children?: IKnowledge[] }>;
  small?: boolean;
}

export default function KnowledgeList({ knowledges = [], small = false }: KnowledgeListProps) {
  const { t } = useLocale();

  if (!knowledges.length) {
    return <div className="px-4 py-6 text-center text-sm text-[var(--second-text-color)]">{t('empty')}</div>;
  }

  return (
    <div className="p-0">
      {knowledges.map((knowledge) => (
        <div
          key={knowledge.id}
          className={`border-b border-[var(--border-color)] last:border-b-0 ${
            small ? 'px-3 py-3' : 'px-4 py-4'
          }`}
        >
          <Link
            href={`/knowledge/${knowledge.id}`}
            className="block no-underline hover:text-[var(--primary-color)]"
          >
            <header className="mb-2">
              <div className="font-semibold text-[var(--main-text-color)]">{knowledge.title}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--second-text-color)]">
                <span className="h-3 w-px bg-[var(--border-color)]" />
                <LocaleTime date={knowledge.publishAt} timeago />
              </div>
            </header>
            {!small ? (
              <main className="flex gap-4">
                <div className="min-w-0 flex-1">
                  {knowledge.summary ? (
                    <p className="m-0 line-clamp-2 text-sm text-[var(--second-text-color)]">{knowledge.summary}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-1 text-xs text-[var(--second-text-color)]">
                    <EyeIcon className="h-3.5 w-3.5" />
                    <span>{knowledge.views}</span>
                  </div>
                </div>
                {knowledge.cover ? (
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded">
                    <Image url={knowledge.cover} size="thumb" alt="cover" loading="lazy" />
                  </div>
                ) : null}
              </main>
            ) : null}
          </Link>
        </div>
      ))}
    </div>
  );
}
