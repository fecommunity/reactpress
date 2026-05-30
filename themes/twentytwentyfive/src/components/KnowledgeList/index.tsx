import { EyeOutlined } from '@ant-design/icons';
import { Divider, Spin } from 'antd';
import cls from 'classnames';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';
import LazyLoad from 'react-lazyload';

import { LocaleTime } from '@/components/LocaleTime';

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
        knowledges.map((knowledge) => {
          return (
            <div key={knowledge.id} className={cls(style.articleItem, small && style.small)}>
              <Link key={knowledge.id} href={`/knowledge/[pId]`} as={`/knowledge/${knowledge.id}`} scroll={false}>
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

                    {knowledge.cover && (
                      <LazyLoad height={120} placeholder={<Spin />}>
                        <div className={style.coverWrapper}>
                          <img src={knowledge.cover} alt="cover" />
                        </div>
                      </LazyLoad>
                    )}
                  </main>
                </a>
              </Link>
            </div>
          );
        })
      ) : (
        <div className={'empty'}>{t('empty')}</div>
      )}
    </div>
  );
};
