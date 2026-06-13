import { createClient } from "@fecommunity/reactpress-toolkit/plugin/react";

import i18n from "@/i18n";
import { parsePaginated } from "@/shared/api/pagination";
import { getConfiguredApiBaseUrl, testApiConnection } from "@/shared/desktop/apiConfig";
import { useAuthStore } from "@/stores/auth";

export type SyncProgress = {
  phase: "settings" | "articles" | "pages" | "done";
  current: number;
  total: number;
};

export type SyncResult = {
  settings: boolean;
  articles: { pushed: number; failed: number };
  pages: { pushed: number; failed: number };
};

async function loginRemote(
  remoteBaseUrl: string,
  username: string,
  password: string,
): Promise<string> {
  const base = remoteBaseUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: username, password }),
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { token?: string };
    token?: string;
  };
  const token = json.data?.token ?? json.token;
  if (!res.ok || !token) {
    throw new Error(i18n.t("desktop.sync.remoteLoginFailed"));
  }
  return token;
}

export async function syncLocalToRemote(options: {
  remoteBaseUrl: string;
  remoteUsername: string;
  remotePassword: string;
  onProgress?: (progress: SyncProgress) => void;
}): Promise<SyncResult> {
  const remoteBase = options.remoteBaseUrl.replace(/\/$/, "");
  if (!(await testApiConnection(remoteBase))) {
    throw new Error(i18n.t("desktop.sync.remoteApiUnreachable"));
  }

  const localBase = (await getConfiguredApiBaseUrl()).replace(/\/$/, "");
  if (!(await testApiConnection(localBase))) {
    throw new Error(i18n.t("desktop.sync.localApiUnreachable"));
  }

  const localToken = useAuthStore.getState().tokens?.accessToken ?? null;
  const localClient = createClient({
    baseURL: localBase,
    getAccessToken: () => localToken,
  });

  const remoteToken = await loginRemote(remoteBase, options.remoteUsername, options.remotePassword);
  const remoteClient = createClient({
    baseURL: remoteBase,
    getAccessToken: () => remoteToken,
  });

  const result: SyncResult = {
    settings: false,
    articles: { pushed: 0, failed: 0 },
    pages: { pushed: 0, failed: 0 },
  };

  options.onProgress?.({ phase: "settings", current: 0, total: 1 });
  try {
    const settings = await localClient.setting.findAll();
    await remoteClient.setting.update({ body: settings as Record<string, unknown> });
    result.settings = true;
  } catch {
    result.settings = false;
  }

  const articles = parsePaginated(
    await localClient.article.findAll({
      query: { page: 1, pageSize: 500 },
    } as Parameters<typeof localClient.article.findAll>[0]),
  ).list as Record<string, unknown>[];

  options.onProgress?.({ phase: "articles", current: 0, total: articles.length });
  for (let i = 0; i < articles.length; i++) {
    const item = articles[i];
    try {
      const id = String(item.id ?? "");
      const body = { ...item };
      delete body.id;
      delete body.createAt;
      delete body.updateAt;
      if (id) {
        await remoteClient.article.updateById(id, { body: body as never });
      } else {
        await remoteClient.article.create({ body: body as never });
      }
      result.articles.pushed += 1;
    } catch {
      result.articles.failed += 1;
    }
    options.onProgress?.({ phase: "articles", current: i + 1, total: articles.length });
  }

  const pages = parsePaginated(
    await localClient.page.findAll({
      query: { page: 1, pageSize: 500 },
    } as Parameters<typeof localClient.page.findAll>[0]),
  ).list as Record<string, unknown>[];

  options.onProgress?.({ phase: "pages", current: 0, total: pages.length });
  for (let i = 0; i < pages.length; i++) {
    const item = pages[i];
    try {
      const id = String(item.id ?? "");
      const body = { ...item };
      delete body.id;
      delete body.createAt;
      delete body.updateAt;
      if (id) {
        await remoteClient.page.updateById(id, { body: body as never });
      } else {
        await remoteClient.page.create({ body: body as never });
      }
      result.pages.pushed += 1;
    } catch {
      result.pages.failed += 1;
    }
    options.onProgress?.({ phase: "pages", current: i + 1, total: pages.length });
  }

  options.onProgress?.({ phase: "done", current: 1, total: 1 });
  return result;
}
