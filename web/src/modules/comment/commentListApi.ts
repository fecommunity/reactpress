import { parsePaginated } from "@/shared/api/pagination";
import { getToolkitClient } from "@/shared/client";

export interface CommentListSearch {
  page: number;
  pageSize: number;
  pass: string;
  keyword: string;
}

export type CommentRow = {
  id: string;
  name: string;
  email: string;
  content: string;
  pass: boolean;
  hostId: string;
  url: string;
  createAt: string;
};

export type CommentStatusCounts = {
  all: number;
  pending: number;
  approved: number;
};

export async function fetchComments(search: CommentListSearch) {
  const api = await getToolkitClient();
  const query: Record<string, string | number> = {
    page: search.page,
    pageSize: search.pageSize,
  };
  if (search.pass) query.pass = search.pass;
  if (search.keyword) query.keyword = search.keyword;
  const res = await api.comment.findAll({
    query,
  } as Parameters<typeof api.comment.findAll>[0]);
  return parsePaginated<CommentRow>(res);
}

async function fetchCommentTotal(pass?: string): Promise<number> {
  const api = await getToolkitClient();
  const query: Record<string, string | number> = { page: 1, pageSize: 1 };
  if (pass) query.pass = pass;
  const res = await api.comment.findAll({
    query,
  } as Parameters<typeof api.comment.findAll>[0]);
  return parsePaginated(res).total;
}

export async function fetchCommentStatusCounts(): Promise<CommentStatusCounts> {
  const [all, pending, approved] = await Promise.all([
    fetchCommentTotal(),
    fetchCommentTotal("0"),
    fetchCommentTotal("1"),
  ]);
  return { all, pending, approved };
}

export async function fetchArticleTitleMap(): Promise<Record<string, string>> {
  const api = await getToolkitClient();
  const res = await api.article.findAll({
    query: { page: 1, pageSize: 500 },
  } as Parameters<typeof api.article.findAll>[0]);
  const { list } = parsePaginated<{ id: string; title: string }>(res);
  const map: Record<string, string> = {};
  for (const article of list) {
    map[article.id] = article.title;
  }
  return map;
}

export async function fetchCommentCountsByArticle(): Promise<Record<string, number>> {
  const api = await getToolkitClient();
  const res = await api.comment.findAll({
    query: { page: 1, pageSize: 500 },
  } as Parameters<typeof api.comment.findAll>[0]);
  const { list } = parsePaginated<{ hostId: string }>(res);
  const counts: Record<string, number> = {};
  for (const comment of list) {
    if (comment.hostId) counts[comment.hostId] = (counts[comment.hostId] ?? 0) + 1;
  }
  return counts;
}
