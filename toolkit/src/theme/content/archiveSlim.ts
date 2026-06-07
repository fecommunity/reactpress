import type { IArticle } from '../../types';

export type ArchiveArticle = Pick<IArticle, 'id' | 'title' | 'publishAt'>;

export type ArchiveTree = Record<string, Record<string, ArchiveArticle[]>>;

export function slimArchiveTree(raw: Record<string, Record<string, IArticle[]>>): ArchiveTree {
  const out: ArchiveTree = {};
  for (const year of Object.keys(raw)) {
    out[year] = {};
    for (const month of Object.keys(raw[year])) {
      out[year][month] = raw[year][month].map(({ id, title, publishAt }) => ({
        id,
        title,
        publishAt,
      }));
    }
  }
  return out;
}

export function countArchiveArticles(articles: ArchiveTree): number {
  let total = 0;
  for (const year of Object.keys(articles)) {
    for (const month of Object.keys(articles[year])) {
      total += articles[year][month].length;
    }
  }
  return total;
}

export function formatArchiveDay(publishAt: string): string {
  const date = new Date(publishAt);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

export function sortedArchiveYears(articles: ArchiveTree): string[] {
  return Object.keys(articles).sort((a, b) => +b - +a);
}
