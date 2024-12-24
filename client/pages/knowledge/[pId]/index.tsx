import { RightOutlined } from '@ant-design/icons';
import { Breadcrumb, Button } from 'antd';
import cls from 'classnames';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useContext, useMemo } from 'react';

import { ListTrail } from '@/components/Animation/Trail';
import { KnowledgeList } from '@/components/KnowledgeList';
import { LocaleTime } from '@/components/LocaleTime';
import { GlobalContext } from '@/context/global';
import { DoubleColumnLayout } from '@/layout/DoubleColumnLayout';
import { KnowledgeProvider } from '@/providers/knowledge';

import style from './index.module.scss';

interface IProps {
  pId: string;
  book: IKnowledge;
  otherBooks: Array<IKnowledge>;
}

const Page: NextPage<IProps> = ({ pId, book, otherBooks = [] }) => {
  const { setting } = useContext(GlobalContext);
  const t = useTranslations();
  const chapters = useMemo(() => (book && book.children) || [], [book]);

  const start = useCallback(() => {
    const chapter = chapters[0];
    window.open(`/knowledge/${pId}/${chapter.id}`);
  }, [chapters, pId]);

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
                      <img src={book.cover} alt="cover" />
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

Page.getInitialProps = async (ctx) => {
  const pId = ctx.query.pId as string;
  const [book, [allBooks]] = await Promise.all([
    KnowledgeProvider.getKnowledge(pId),
    KnowledgeProvider.getKnowledges({
      page: 1,
      pageSize: 6,
      status: 'publish',
    }),
  ]);
  return {
    pId,
    book,
    otherBooks: allBooks.filter((b) => b.id !== book.id),
    needLayoutFooter: true,
  };
};

export default Page;
