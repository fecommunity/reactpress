import {
  defaultSiteThemeState,
  getConfigurationSchemaFromManifest,
  getMergedThemeConfiguration,
  getThemeConfigurationSeed,
  TWENTYTWENTYFIVE_APPEARANCE,
  TWENTYTWENTYFIVE_CONFIGURATION_SCHEMA,
  validateAndMergeThemeConfiguration,
} from "@fecommunity/reactpress-toolkit/theme";
import { http, HttpResponse, passthrough } from "msw";

import helloWorldAdminEn from "../../../../themes/hello-world/locales/en.json";
import twentytwentyfiveAdminEn from "../../../../themes/twentytwentyfive/locales/en.json";
import { successResponse, withDelay } from "../createHandler";
import { getMockGlobalSetting, patchMockGlobalSettingTheme, setMockGlobalSetting } from "./page";

const THEME_ADMIN_LOCALES: Record<string, Record<string, Record<string, unknown>>> = {
  twentytwentyfive: { en: twentytwentyfiveAdminEn },
  "hello-world": { en: helloWorldAdminEn },
};

const MOCK_THEMES = [
  {
    id: "twentytwentyfive",
    name: "Twenty Twenty-Five",
    version: "1.0.0",
    description: "支持多栏布局的现代博客主题。",
    author: "ReactPress",
    tags: ["博客", "自适应"],
    source: "starter" as const,
    installed: true,
    active: true,
    coverUrl: "/api/extension/themes/twentytwentyfive/cover",
    options: TWENTYTWENTYFIVE_CONFIGURATION_SCHEMA,
    appearance: TWENTYTWENTYFIVE_APPEARANCE,
  },
  {
    id: "hello-world",
    name: "Hello World",
    version: "1.0.0",
    description: "极简入门主题。",
    author: "ReactPress",
    tags: ["极简", "入门"],
    source: "starter" as const,
    installed: true,
    active: false,
    coverUrl: "/api/extension/themes/hello-world/cover",
    appearance: {
      sections: [
        {
          id: "identity",
          title: "站点身份",
          settings: [
            { id: "siteLogo", type: "image", label: "站点 Logo" },
            { id: "displayTitle", type: "text", label: "站点标题", default: "Hello World" },
            { id: "displayTagline", type: "text", label: "站点副标题" },
          ],
        },
        {
          id: "colors",
          title: "颜色与深色模式",
          settings: [
            { id: "primaryColor", type: "color", label: "主色", default: "#c02b5a" },
            { id: "backgroundColor", type: "color", label: "背景色", default: "#ffffff" },
            { id: "darkMode", type: "checkbox", label: "启用深色模式", default: "0" },
          ],
        },
        {
          id: "background",
          title: "背景图片",
          settings: [{ id: "backgroundImage", type: "image", label: "背景图" }],
        },
      ],
    },
  },
];

/** 仅默认主题已安装，便于在 Web 端验证「安装 → 启用」流程 */
let themeState: typeof defaultSiteThemeState = {
  activeTheme: defaultSiteThemeState.activeTheme,
  installedThemes: [defaultSiteThemeState.activeTheme],
  mods: {},
  previewThemeId: defaultSiteThemeState.activeTheme,
};

function themeManifest(themeId: string) {
  return MOCK_THEMES.find((t) => t.id === themeId) ?? null;
}

function coverSvg(themeId: string, name: string, primary = "#2271b1", accent = "#72aee6") {
  const safeName = name.replace(/[<>&"']/g, (ch) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch] ?? ch;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs><linearGradient id="bg-${themeId}" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${primary}" /><stop offset="55%" stop-color="${accent}" /><stop offset="100%" stop-color="#ffffff" />
  </linearGradient></defs>
  <rect width="800" height="500" fill="url(#bg-${themeId})" />
  <text x="400" y="250" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="42" font-weight="700">${safeName}</text>
</svg>`;
}

function previewHtml(themeId: string, mods: Record<string, string> = {}) {
  const theme = MOCK_THEMES.find((t) => t.id === themeId) ?? MOCK_THEMES[0];
  const defaults: Record<string, string> = {};
  for (const section of theme.appearance?.sections ?? []) {
    for (const s of section.settings ?? []) {
      if (s.default) defaults[s.id] = s.default;
    }
  }
  const merged = { ...defaults, ...mods };
  const primary = merged.primaryColor ?? "#2271b1";
  const accent = merged.accentColor ?? "#d63638";
  const title = merged.displayTitle ?? theme.name;
  const bg = merged.backgroundColor ?? "#f0f0f1";
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:${bg};color:#1d2327;line-height:1.6}
    .wrap{max-width:720px;margin:0 auto;padding:2rem 1.5rem}
    h1{color:${primary};margin:0 0 .5rem} h2{color:${accent}}</style></head><body><div class="wrap"><h1>${title}</h1><p>${
      theme.description ?? ""
    }</p><h2>Preview</h2><p>主题 ${theme.name} 实时预览。</p></div></body></html>`;
}

export const themeHandlers = [
  http.get("/api/extension/themes", async () => {
    await withDelay(120);
    return successResponse(
      MOCK_THEMES.map((t) => ({
        ...t,
        active: t.id === themeState.activeTheme,
        installed: themeState.installedThemes.includes(t.id),
      })),
    );
  }),

  http.get("/api/extension/themes/:id", async ({ params }) => {
    await withDelay(100);
    const theme = MOCK_THEMES.find((t) => t.id === params.id);
    if (!theme) return successResponse(null);
    return successResponse({
      ...theme,
      active: theme.id === themeState.activeTheme,
      installed: themeState.installedThemes.includes(theme.id),
    });
  }),

  http.get("/api/extension/themes/:id/locales/:locale", async ({ params }) => {
    await withDelay(60);
    const id = String(params.id);
    const locale = String(params.locale);
    if (!themeManifest(id)) {
      return HttpResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }
    const messages = THEME_ADMIN_LOCALES[id]?.[locale] ?? {};
    return successResponse({ themeId: id, locale, messages });
  }),

  http.get("/api/extension/themes/:id/configuration-schema", async ({ params }) => {
    await withDelay(80);
    const id = String(params.id);
    const manifest = themeManifest(id);
    if (!manifest)
      return HttpResponse.json({ success: false, message: "Not found" }, { status: 404 });
    const schema = getConfigurationSchemaFromManifest(manifest, id);
    return successResponse({ themeId: id, schema });
  }),

  http.get("/api/extension/themes/:id/configuration", async ({ params }) => {
    await withDelay(80);
    const id = String(params.id);
    const manifest = themeManifest(id);
    if (!manifest)
      return HttpResponse.json({ success: false, message: "Not found" }, { status: 404 });
    const configuration = getMergedThemeConfiguration(getMockGlobalSetting(), id, { manifest });
    return successResponse({ themeId: id, configuration });
  }),

  http.post("/api/extension/themes/:id/configuration", async ({ params, request }) => {
    await withDelay(120);
    const id = String(params.id);
    const manifest = themeManifest(id);
    if (!manifest)
      return HttpResponse.json({ success: false, message: "Not found" }, { status: 404 });
    const body = (await request.json()) as {
      configuration?: Record<string, unknown>;
      replace?: boolean;
    };
    const global = getMockGlobalSetting();
    let storedConfig: Record<string, unknown>;
    if (body.replace === true) {
      storedConfig =
        getThemeConfigurationSeed(id, "zh") ??
        getMergedThemeConfiguration(global, id, { manifest });
    } else {
      const result = validateAndMergeThemeConfiguration(
        id,
        global,
        body.configuration ?? {},
        manifest,
      );
      if (!result.ok) {
        return HttpResponse.json({ success: false, message: result.message }, { status: 400 });
      }
      storedConfig = result.config;
    }
    const next = { ...global, config: { ...(global.config as object), [id]: storedConfig } };
    setMockGlobalSetting(next);
    const configuration = getMergedThemeConfiguration(next, id, { manifest });
    return successResponse({ themeId: id, configuration });
  }),

  http.get("/api/extension/themes/:id/cover", async ({ params }) => {
    await withDelay(60);
    const theme = MOCK_THEMES.find((t) => t.id === params.id) ?? MOCK_THEMES[0];
    const primary =
      theme.appearance?.sections
        ?.flatMap((sec) => sec.settings ?? [])
        .find((s) => s.id === "primaryColor")?.default ?? "#2271b1";
    const accent =
      theme.appearance?.sections
        ?.flatMap((sec) => sec.settings ?? [])
        .find((s) => s.id === "accentColor")?.default ?? "#d63638";
    return new Response(coverSvg(String(params.id), theme.name, primary, accent), {
      headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  }),

  /** Must hit real API so visitor site (:3001) SSR can read the same in-memory draft. */
  http.post("/api/extension/themes/preview-draft", () => passthrough()),
  http.get("/api/extension/themes/preview-draft/:token", () => passthrough()),

  http.get("/api/extension/themes/:id/preview", async ({ params, request }) => {
    await withDelay(80);
    const url = new URL(request.url);
    let mods: Record<string, string> = {};
    const token = url.searchParams.get("token");
    if (token) {
      /* Live visitor preview uses :3001; stub HTML cannot apply theme configuration. */
      mods = {};
    } else {
      const raw = url.searchParams.get("mods");
      if (raw) {
        try {
          mods = JSON.parse(decodeURIComponent(raw)) as Record<string, string>;
        } catch {
          mods = {};
        }
      }
    }
    return new Response(previewHtml(String(params.id), mods), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }),

  http.post("/api/extension/themes/:id/install", async ({ params }) => {
    await withDelay(150);
    if (!themeState.installedThemes.includes(String(params.id))) {
      themeState = {
        ...themeState,
        installedThemes: [...themeState.installedThemes, String(params.id)],
      };
    }
    patchMockGlobalSettingTheme(themeState);
    return successResponse(themeState);
  }),

  http.post("/api/extension/themes/:id/activate", async ({ params }) => {
    await withDelay(150);
    const id = String(params.id);
    themeState = {
      ...themeState,
      activeTheme: id,
      previewThemeId: id,
      installedThemes: themeState.installedThemes.includes(id)
        ? themeState.installedThemes
        : [...themeState.installedThemes, id],
    };
    patchMockGlobalSettingTheme(themeState);
    return successResponse(themeState);
  }),

  http.post("/api/extension/themes/:id/preview-session", async ({ params }) => {
    await withDelay(80);
    const id = String(params.id);
    themeState = { ...themeState, previewThemeId: id };
    patchMockGlobalSettingTheme(themeState);
    const siteUrl = "http://localhost:3001";
    return successResponse({
      ...themeState,
      activeTheme: themeState.activeTheme,
      siteUrl,
      previewSiteUrl: id !== themeState.activeTheme ? "http://localhost:3003/" : undefined,
    });
  }),

  http.post("/api/extension/themes/preview-session/end", async () => {
    await withDelay(80);
    themeState = { ...themeState, previewThemeId: themeState.activeTheme };
    patchMockGlobalSettingTheme(themeState);
    return successResponse({ ...themeState, siteUrl: "http://localhost:3001" });
  }),

  http.post("/api/extension/themes/:id/mods", async ({ params, request }) => {
    await withDelay(120);
    const body = (await request.json()) as { mods?: Record<string, string> };
    const id = String(params.id);
    const themeMods = { ...themeState.mods[id] };
    for (const [key, value] of Object.entries(body.mods ?? {})) {
      if (value === "") {
        delete themeMods[key];
      } else {
        themeMods[key] = value;
      }
    }
    themeState = {
      ...themeState,
      mods: { ...themeState.mods, [id]: themeMods },
      previewThemeId: id,
    };
    patchMockGlobalSettingTheme(themeState);
    return successResponse(themeState);
  }),
];
