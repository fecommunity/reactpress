import { EyeOutlined } from '@/icons';
import { Divider } from '@/ui';
import cls from 'classnames';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Image, LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';

import style from './index.module.scss';

interface IProps {
  small?: boolean;
  knowledges: IKnowledge[];
}

export const KnowledgeList: React.FC<IProps> = ({ knowledges = [], small = false }) => {
  const t = useTranslations();
  return (
    <div className={style.wrapper}>
      {knowledges && knowledges.length ? (
        knowledges.map((knowledge) => (
          <div key={knowledge.id} className={cls(style.articleItem, small && style.small)}>
            <Link href={`/knowledge/[pId]`} as={`/knowledge/${knowledge.id}`} scroll={false}>
              <a aria-label={knowledge.title}>
                <header>
                  <div className={style.title}>{knowledge.title}</div>
                  <div className={style.info}>
                    <Divider type="vertical" />
                    <span className={style.time}>
                      <LocaleTime date={knowledge.publishAt} timeago={true} />
                    </span>
                  </div>
                </header>
                <main>
                  <div className={style.contentWrapper}>
                    <div className={style.desc}>{knowledge.summary}</div>
                    <div className={style.meta}>
                      <span>
                        <EyeOutlined />
                        <span className={style.number}>{knowledge.views}</span>
                      </span>
                    </div>
                  </div>
                  {knowledge.cover ? (
                    <div className={style.coverWrapper}>
                      <Image url={knowledge.cover} size="thumb" alt="cover" loading="lazy" />
                    </div>
                  ) : null}
                </main>
              </a>
            </Link>
          </div>
        ))
      ) : (
        <div className={'empty'}>{t('empty')}</div>
      )}
    </div>
  );
};
