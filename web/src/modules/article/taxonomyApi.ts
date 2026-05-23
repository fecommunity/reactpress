import { slugifyMetaValue } from "@/modules/article/articleEditorApi";
import { getToolkitClient } from "@/shared/client";

export type TaxonomyItem = {
  id: string;
  label: string;
  value: string;
  articleCount?: number;
};

function normalizeItem(raw: Record<string, unknown>): TaxonomyItem {
  return {
    id: String(raw.id ?? ""),
    label: String(raw.label ?? ""),
    value: String(raw.value ?? ""),
    articleCount:
      typeof raw.articleCount === "number"
        ? raw.articleCount
        : Array.isArray(raw.articles)
          ? raw.articles.length
          : 0,
  };
}

export async function fetchTaxonomyList(kind: "category" | "tag"): Promise<TaxonomyItem[]> {
  const api = await getToolkitClient();
  const res = kind === "category" ? await api.category.findAll() : await api.tag.findAll();
  const list = Array.isArray(res) ? res : [];
  return list.map((item) => normalizeItem(item as Record<string, unknown>));
}

export async function createTaxonomyItem(
  kind: "category" | "tag",
  label: string,
  value: string,
): Promise<TaxonomyItem> {
  const api = await getToolkitClient();
  const body = {
    label: label.trim(),
    value: value.trim() || slugifyMetaValue(label) || label.trim(),
  };
  const res =
    kind === "category"
      ? await api.category.create({ body } as Parameters<typeof api.category.create>[0])
      : await api.tag.create({ body } as Parameters<typeof api.tag.create>[0]);
  const item = Array.isArray(res) ? res[0] : res;
  return normalizeItem((item ?? {}) as Record<string, unknown>);
}

export async function updateTaxonomyItem(
  kind: "category" | "tag",
  id: string,
  data: { label: string; value: string },
): Promise<TaxonomyItem> {
  const api = await getToolkitClient();
  const params = { body: data } as Parameters<typeof api.category.updateById>[1];
  const res =
    kind === "category"
      ? await api.category.updateById(id, params)
      : await api.tag.updateById(id, params);
  return normalizeItem((res ?? {}) as Record<string, unknown>);
}

export async function deleteTaxonomyItem(kind: "category" | "tag", id: string): Promise<void> {
  const api = await getToolkitClient();
  if (kind === "category") {
    await api.category.deleteById(id);
  } else {
    await api.tag.deleteById(id);
  }
}
