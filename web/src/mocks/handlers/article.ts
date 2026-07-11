import { http } from "msw";

import { ERROR_CODES, errorResponse, successResponse, withDelay } from "../createHandler";
import type { MockArticle } from "../data";
import { MOCK_ARTICLES } from "../data";
import { paginateList, parsePaginationParams } from "../utils";

let articles = MOCK_ARTICLES.map((a) => ({
  ...a,
  category: a.category ? { ...a.category } : null,
  tags: a.tags.map((t) => ({ ...t })),
}));

function filterArticles(
  list: MockArticle[],
  options: {
    status?: string;
    title?: string;
    categoryId?: string;
    tag?: string;
    month?: string;
    author?: string;
  },
): MockArticle[] {
  let filtered = [...list];
  if (options.status) {
    filtered = filtered.filter((a) => a.status === options.status);
  }
  if (options.title) {
    filtered = filtered.filter((a) => a.title.includes(options.title!));
  }
  if (options.categoryId) {
    filtered = filtered.filter((a) => a.category?.id === options.categoryId);
  }
  if (options.tag) {
    filtered = filtered.filter((a) => a.tags.some((t) => t.value === options.tag));
  }
  if (options.month) {
    filtered = filtered.filter((a) => a.publishAt?.startsWith(options.month!));
  }
  if (options.author) {
    const author = options.author.toLowerCase();
    filtered = filtered.filter((a) => {
      const name = (a as MockArticle & { author?: string }).author?.toLowerCase();
      return !name || name === author;
    });
  }
  return filtered;
}

function cloneArticle(article: MockArticle): MockArticle {
  return {
    ...article,
    category: article.category ? { ...article.category } : null,
    tags: article.tags.map((t) => ({ ...t })),
  };
}

function listArticlesFromRequest(url: URL) {
  const { limit, offset } = parsePaginationParams(url.searchParams);
  const status = url.searchParams.get("status") ?? "";
  const title = url.searchParams.get("title") ?? "";
  const categoryId = url.searchParams.get("category") ?? "";
  const tag = url.searchParams.get("tag") ?? "";
  const author = url.searchParams.get("author") ?? "";
  const publishAt = url.searchParams.get("publishAt") ?? "";
  const month = /^\d{4}-\d{2}$/.test(publishAt) ? publishAt : undefined;

  const filtered = filterArticles(articles, {
    status: status || undefined,
    title: title || undefined,
    categoryId: categoryId || undefined,
    tag: tag || undefined,
    month,
    author: author || undefined,
  });
  const list = paginateList(filtered, limit, offset).map(cloneArticle);
  return successResponse([list, filtered.length]);
}

export const articleHandlers = [
  http.get("/api/article/tag/:value", async ({ params, request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const { limit, offset } = parsePaginationParams(url.searchParams);
    const status = url.searchParams.get("status") ?? "";
    const title = url.searchParams.get("title") ?? "";
    const publishAt = url.searchParams.get("publishAt") ?? "";
    const month = /^\d{4}-\d{2}$/.test(publishAt) ? publishAt : undefined;
    const author = url.searchParams.get("author") ?? "";

    let filtered = articles.filter((a) => a.tags.some((t) => t.value === params.value));
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (title) filtered = filtered.filter((a) => a.title.includes(title));
    if (month) filtered = filtered.filter((a) => a.publishAt?.startsWith(month));
    if (author) {
      filtered = filtered.filter((a) => {
        const name = (a as MockArticle & { author?: string }).author;
        return !name || name === author;
      });
    }

    const list = paginateList(filtered, limit, offset).map(cloneArticle);
    return successResponse([list, filtered.length]);
  }),

  http.get("/api/article/category/:value", async ({ params, request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const { limit, offset } = parsePaginationParams(url.searchParams);
    const status = url.searchParams.get("status") ?? "";
    const title = url.searchParams.get("title") ?? "";
    const publishAt = url.searchParams.get("publishAt") ?? "";
    const month = /^\d{4}-\d{2}$/.test(publishAt) ? publishAt : undefined;

    let filtered = articles.filter((a) => a.category?.value === params.value);
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (title) filtered = filtered.filter((a) => a.title.includes(title));
    if (month) filtered = filtered.filter((a) => a.publishAt?.startsWith(month));

    const list = paginateList(filtered, limit, offset).map(cloneArticle);
    return successResponse([list, filtered.length]);
  }),

  http.get("/api/article", async ({ request }) => {
    await withDelay(200);
    return listArticlesFromRequest(new URL(request.url));
  }),

  http.get("/api/article/:id", async ({ params }) => {
    await withDelay(200);
    if (params.id === "category" || params.id === "tag") {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Article not found");
    }
    const article = articles.find((a) => a.id === params.id);
    if (!article) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Article not found");
    }
    return successResponse(cloneArticle(article));
  }),

  http.post("/api/article", async ({ request }) => {
    await withDelay(200);
    const body = (await request.json()) as Partial<MockArticle>;
    const status = body.status === "publish" ? "publish" : "draft";
    const newArticle: MockArticle = {
      id: String(articles.length + 1),
      title: String(body.title ?? "Untitled"),
      summary: String(body.summary ?? ""),
      slug: body.slug ?? null,
      seoKeywords: body.seoKeywords ?? null,
      seoDescription: body.seoDescription ?? null,
      content: String(body.content ?? ""),
      html: String(body.html ?? ""),
      cover: body.cover ?? null,
      status,
      views: 0,
      publishAt: status === "publish" ? new Date().toISOString() : null,
      category: (body.category as MockArticle["category"]) ?? null,
      tags: Array.isArray(body.tags) ? (body.tags as MockArticle["tags"]) : [],
      isRecommended: body.isRecommended ?? true,
      isCommentable: body.isCommentable ?? true,
      password: body.password ?? null,
      needPassword: Boolean(body.password),
    };
    articles = [newArticle, ...articles];
    return successResponse(cloneArticle(newArticle));
  }),

  http.patch("/api/article/:id", async ({ params, request }) => {
    await withDelay(200);
    const body = (await request.json()) as Partial<MockArticle>;
    const idx = articles.findIndex((a) => a.id === params.id);
    if (idx === -1) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Article not found");
    }
    const prev = articles[idx];
    const status = body.status ?? prev.status;
    const merged: MockArticle = {
      ...prev,
      ...body,
      status: status as MockArticle["status"],
      publishAt:
        status === "publish"
          ? (body.publishAt ?? prev.publishAt ?? new Date().toISOString())
          : status === "draft"
            ? null
            : prev.publishAt,
      needPassword: body.password != null ? Boolean(body.password) : prev.needPassword,
    };
    articles[idx] = merged;
    return successResponse(cloneArticle(merged));
  }),

  http.delete("/api/article/:id", async ({ params }) => {
    await withDelay(200);
    const exists = articles.some((a) => a.id === params.id);
    if (!exists) {
      return errorResponse(ERROR_CODES.NOT_FOUND, "Article not found");
    }
    articles = articles.filter((a) => a.id !== params.id);
    return successResponse(null);
  }),
];
