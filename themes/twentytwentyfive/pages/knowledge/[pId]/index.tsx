import { RightOutlined } from '@/icons';
import { Breadcrumb, Button } from '@/ui';
import cls from 'classnames';
import type { GetStaticProps } from 'next';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { ListTrail } from '@/components/Animation/Trail';
import { KnowledgeList } from '@/components/KnowledgeList';
import { Image, LocaleTime } from '@fecommunity/reactpress-toolkit/ui/content';
import {
  fetchKnowledgeBookPageProps,
  themeApi,
  themeNotFound,
  themeOnDemandPaths,
  themeStaticProps,
  useSiteSetting,
  withApiRetry,
} from '@fecommunity/reactpress-toolkit/theme';

import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';

import style from './index.module.scss';

interface IProps {
  pId: string;
  book: IKnowledge;
  otherBooks: Array<IKnowledge>;
}

export const getStaticPaths = () => themeOnDemandPaths;

export const getStaticProps: GetStaticProps = async (ctx) => {
  const pId = ctx.params?.pId;
  if (typeof pId !== 'string' || !pId) return themeNotFound();

  try {
    const data = await withApiRetry(() => fetchKnowledgeBookPageProps(themeApi, pId));
    if (!data.book) return themeNotFound();
    return themeStaticProps({ ...data, needLayoutFooter: true });
  } catch (error) {
    console.error('[reactpress] fetch knowledge book page', error);
    return themeNotFound();
  }
};

const Page: NextPage<IProps> = ({ pId, book, otherBooks = [] }) => {
  const router = useRouter();
  const setting = useSiteSetting();
  const t = useTranslations();
  const chapters = useMemo(() => (book && book.children) || [], [book]);

  const start = useCallback(() => {
    const chapter = chapters[0];
    if (!chapter) return;
    window.open(`/knowledge/${pId}/${chapter.id}`);
  }, [chapters, pId]);

  if (router.isFallback || !book?.id) {
    return <div className="loading">{t('loading')}</div>;
  }

  if (!book) {
    return null;
  }

  return (
    <div className={style.wrapper}>
      <DoubleColumnLayout
        minHeight={'0px'}
        topNode={
          <div className="container">
            <div className={style.breadcrump}>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link href="/knowledge">
                    <a aria-label="knowledges books">{t('knowledgeBooks')}</a>
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{book.title}</Breadcrumb.Item>
              </Breadcrumb>
            </div>
          </div>
        }
        leftNode={
          <div className={style.content}>
            <Head>
              <title>{`${book.title} - ${t('knowledge')} - ${setting.systemTitle}`}</title>
            </Head>
            <section className={cls(style.tocWrapper)}>
              <header>{book.title}</header>
              <main className={style.bgMain}>
                <section className={style.desc}>
                  {book.cover && (
                    <div className={style.coverWrapper}>
                      <Image url={book.cover} size="medium" alt="cover" />
                    </div>
                  )}
                  <div className={style.infoWrapper}>
                    <div>
                      <p className={style.title}>{book.title}</p>
                      <p className={style.desc}>{book.summary}</p>
                      <p className={style.meta}>
                        <span>
                          {book.views} {t('readingCount')}
                        </span>
                        <span className={style.seperator}>·</span>
                        <span className={style.pullRight}>
                          <LocaleTime date={book.publishAt} />
                        </span>
                      </p>
                      <div className={style.btnWrap}>
                        <Button type="primary" onClick={start} disabled={!chapters.length}>
                          {t('startReading')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
                {chapters.length ? (
                  <ul>
                    <ListTrail
                      length={chapters.length}
                      options={{
                        opacity: 1,
                        height: 44,
                        from: { opacity: 0, height: 0 },
                      }}
                      renderItem={(idx) => {
                        const chapter = chapters[idx];

                        return (
                          <Link as={`/knowledge/${pId}/${chapter.id}`} href={`/knowledge/[pId]/[id]`}>
                            <a aria-label={chapter.title}>
                              <span>{chapter.title}</span>
                              <span>
                                <LocaleTime date={chapter.createAt} />
                                <RightOutlined />
                              </span>
                            </a>
                          </Link>
                        );
                      }}
                    />
                  </ul>
                ) : (
                  <div className={'empty'}>{t('pleaseWait')}</div>
                )}
              </main>
            </section>
          </div>
        }
        rightNode={
          <div className={cls('sticky', style.tocWrapper)}>
            <header>{t('otherKnowledges')}</header>
            <main>
              <KnowledgeList small={true} knowledges={otherBooks} />
            </main>
          </div>
        }
        isRightNodeMobileHidden={false}
      />
    </div>
  );
};

export default Page;
