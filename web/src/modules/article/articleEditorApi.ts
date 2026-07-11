import type { ArticleCategoryItem, ArticleTagItem } from "@/modules/article/articleListApi";
import { getToolkitClient } from "@/shared/client";
import { coerceApiString } from "@/shared/coerceApiString";

export type EditorCategory = ArticleCategoryItem & { labelKey?: string };
export type EditorTag = ArticleTagItem;
export type ArticleVisibility = "public" | "private";

export function slugifyMetaValue(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "");
}

export async function createEditorCategory(label: string): Promise<EditorCategory> {
  const api = await getToolkitClient();
  const value = slugifyMetaValue(label) || label.trim();
  const res = await api.category.create({
    body: { label: label.trim(), value },
  } as Parameters<typeof api.category.create>[0]);
  const item = (Array.isArray(res) ? res[0] : res) as unknown as Record<string, unknown>;
  return {
    id: coerceApiString(item.id),
    label: coerceApiString(item.label, label.trim()),
    value: coerceApiString(item.value, value),
  };
}

export async function createEditorTag(label: string): Promise<EditorTag> {
  const api = await getToolkitClient();
  const value = slugifyMetaValue(label) || label.trim();
  const res = await api.tag.create({
    body: { label: label.trim(), value },
  } as Parameters<typeof api.tag.create>[0]);
  const item = (Array.isArray(res) ? res[0] : res) as unknown as Record<string, unknown>;
  return {
    id: coerceApiString(item.id),
    label: coerceApiString(item.label, label.trim()),
    value: coerceApiString(item.value, value),
  };
}

export function visibilityFromArticle(loaded: {
  password?: unknown;
  needPassword?: unknown;
}): ArticleVisibility {
  if (loaded.needPassword === true) return "private";
  const pwd = loaded.password;
  if (typeof pwd === "string" && pwd.length > 0) return "private";
  return "public";
}

export function normalizeEditorCategory(
  raw: unknown,
  options: EditorCategory[],
): EditorCategory | null {
  if (raw == null || raw === "") return null;

  if (typeof raw === "string" || typeof raw === "number") {
    const id = String(raw);
    return options.find((c) => c.id === id || c.value === id) ?? null;
  }

  if (typeof raw === "object") {
    const o = raw as { id?: string | number; value?: string; label?: string };
    const id = o.id != null ? String(o.id) : "";
    const found = options.find((c) => c.id === id || (o.value && c.value === o.value)) ?? null;
    if (found) return found;
    if (id && o.label) {
      return { id, label: o.label, value: o.value ?? id };
    }
  }

  return null;
}

export function normalizeEditorTags(raw: unknown, options: EditorTag[]): EditorTag[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const result: EditorTag[] = [];

  for (const item of list) {
    if (typeof item === "string" || typeof item === "number") {
      const id = String(item);
      const found = options.find((t) => t.id === id || t.value === id);
      if (found && !result.some((r) => r.id === found.id)) result.push(found);
      continue;
    }
    if (typeof item === "object" && item !== null) {
      const o = item as { id?: string | number; value?: string; label?: string };
      const id = o.id != null ? String(o.id) : "";
      const found = options.find((t) => t.id === id || (o.value && t.value === o.value)) ?? null;
      if (found) {
        if (!result.some((r) => r.id === found.id)) result.push(found);
        continue;
      }
      if (id) {
        const tag = {
          id,
          label: o.label ?? o.value ?? id,
          value: o.value ?? id,
        };
        if (!result.some((r) => r.id === tag.id)) result.push(tag);
      }
    }
  }

  return result;
}

export function buildArticleSaveBody(
  draft: {
    title: string;
    content: string;
    html: string;
    toc: string;
    summary: string;
    slug: string;
    seoKeywords: string;
    seoDescription: string;
    status: "draft" | "publish";
    cover: string | null;
    category: EditorCategory | null;
    tags: EditorTag[];
    isRecommended: boolean;
    isCommentable: boolean;
    visibility: ArticleVisibility;
    password: string | null;
  },
  options?: { includeSeo?: boolean },
) {
  const isPrivate = draft.visibility === "private";
  const includeSeo = options?.includeSeo !== false;
  const body: Record<string, unknown> = {
    title: draft.title.trim(),
    content: draft.content,
    html: draft.html,
    toc: draft.toc,
    summary: draft.summary,
    status: draft.status,
    cover: draft.cover,
    category: draft.category?.id ?? null,
    tags: draft.tags.map((t) => t.id).join(","),
    isRecommended: draft.isRecommended,
    isCommentable: draft.isCommentable,
    password: isPrivate ? draft.password : null,
  };
  if (includeSeo) {
    body.slug = slugifyMetaValue(draft.slug) || null;
    body.seoKeywords = draft.seoKeywords.trim() || null;
    body.seoDescription = draft.seoDescription.trim() || null;
  }
  return body;
}
