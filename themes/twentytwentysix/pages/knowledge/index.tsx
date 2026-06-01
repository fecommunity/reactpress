import DoubleColumnLayout from '@/components/DoubleColumnLayout';
import PageHead from '@/components/PageHead';
import Sidebar from '@/components/Sidebar';
import {
  fetchKnowledgeList,
  PageHeader,
  themeApi,
  useSiteCatalog,
} from '@fecommunity/reactpress-toolkit/theme';
import { NextPage } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface KnowledgeItem {
  id: string;
  title: string;
  summary?: string;
  cover?: string;
}

interface KnowledgeProps {
  books: KnowledgeItem[];
}

const KnowledgePage: NextPage<KnowledgeProps> = ({ books = [] }) => {
  const t = useTranslations();
  const { categories, tags } = useSiteCatalog();

  return (
    <>
      <PageHead title={t('knowledge') || 'Knowledge'} />
      <DoubleColumnLayout
        top={
          <PageHeader
            title={t('knowledge') || 'Knowledge'}
            titleClassName="text-2xl font-bold tracking-tight"
            description={t('knowledgeDescription') || 'Knowledge base and documentation.'}
            descriptionClassName="text-muted-foreground"
          />
        }
        main={
          books.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {books.map((book) => (
                <li key={book.id}>
                  <Link href={`/knowledge/${book.id}`}>
                    <a className="card-surface block no-underline transition-shadow hover:shadow-md">
                      <h2 className="font-semibold text-foreground">{book.title}</h2>
                      {book.summary ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{book.summary}</p>
                      ) : null}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('noKnowledge') || 'No knowledge books published yet.'}
            </p>
          )
        }
        sidebar={<Sidebar categories={categories} tags={tags} />}
      />
    </>
  );
};

KnowledgePage.getInitialProps = async () => {
  try {
    const books = await fetchKnowledgeList(themeApi, { page: 1, pageSize: 24, status: 'publish' });
    return { books, needLayoutFooter: true };
  } catch {
    return { books: [], needLayoutFooter: true };
  }
};

export default KnowledgePage;
