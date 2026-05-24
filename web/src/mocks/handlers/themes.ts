import { http } from "msw";
import { withDelay, successResponse } from "../createHandler";
import { defaultSiteThemeState } from "@fecommunity/reactpress-toolkit/extension";
import { patchMockGlobalSettingTheme } from "./page";

const MOCK_THEMES = [
  {
    id: "twentytwentyfive",
    name: "Twenty Twenty-Five",
    version: "1.0.0",
    description: "支持多栏布局的现代博客主题。",
    author: "ReactPress",
    tags: ["博客", "自适应"],
    source: "bundled" as const,
    installed: true,
    active: true,
    screenshotUrl: "/api/extension/themes/twentytwentyfive/screenshot",
    customizer: {
      sections: [
        {
          id: "colors",
          title: "颜色",
          settings: [
            { id: "primaryColor", type: "color", label: "主色", default: "#1a1a1a" },
            { id: "accentColor", type: "color", label: "强调色", default: "#d63638" },
            { id: "backgroundColor", type: "color", label: "背景色", default: "#ffffff" },
          ],
        },
        {
          id: "identity",
          title: "站点身份",
          settings: [
            { id: "displayTitle", type: "text", label: "展示标题", default: "Twenty Twenty-Five" },
          ],
        },
      ],
    },
  },
  {
    id: "hello-world",
    name: "Hello World",
    version: "1.0.0",
    description: "极简入门主题。",
    author: "ReactPress",
    tags: ["极简", "入门"],
    source: "bundled" as const,
    installed: true,
    active: false,
    screenshotUrl: "/api/extension/themes/hello-world/screenshot",
    customizer: {
      sections: [
        {
          id: "colors",
          title: "颜色",
          settings: [
            { id: "primaryColor", type: "color", label: "主色", default: "#2271b1" },
            { id: "accentColor", type: "color", label: "强调色", default: "#72aee6" },
            { id: "backgroundColor", type: "color", label: "背景色", default: "#f6f7f7" },
          ],
        },
        {
          id: "identity",
          title: "站点身份",
          settings: [
            { id: "displayTitle", type: "text", label: "展示标题", default: "Hello World" },
          ],
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

function screenshotSvg(themeId: string, name: string, primary = "#2271b1", accent = "#72aee6") {
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
  for (const section of theme.customizer?.sections ?? []) {
    for (const s of section.settings) {
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
    h1{color:${primary};margin:0 0 .5rem} h2{color:${accent}}</style></head><body><div class="wrap"><h1>${title}</h1><p>${theme.description ?? ""}</p><h2>Preview</h2><p>主题 ${theme.name} 实时预览。</p></div></body></html>`;
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

  http.get("/api/extension/themes/:id/screenshot", async ({ params }) => {
    await withDelay(60);
    const theme = MOCK_THEMES.find((t) => t.id === params.id) ?? MOCK_THEMES[0];
    const primary =
      theme.customizer?.sections?.flatMap((s) => s.settings).find((s) => s.id === "primaryColor")
        ?.default ?? "#2271b1";
    const accent =
      theme.customizer?.sections?.flatMap((s) => s.settings).find((s) => s.id === "accentColor")
        ?.default ?? "#72aee6";
    return new Response(screenshotSvg(String(params.id), theme.name, primary, accent), {
      headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  }),

  http.get("/api/extension/themes/:id/preview", async ({ params, request }) => {
    await withDelay(80);
    const url = new URL(request.url);
    let mods: Record<string, string> = {};
    const raw = url.searchParams.get("mods");
    if (raw) {
      try {
        mods = JSON.parse(decodeURIComponent(raw)) as Record<string, string>;
      } catch {
        mods = {};
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

  http.post("/api/extension/themes/:id/mods", async ({ params, request }) => {
    await withDelay(120);
    const body = (await request.json()) as { mods?: Record<string, string> };
    const id = String(params.id);
    themeState = {
      ...themeState,
      mods: { ...themeState.mods, [id]: { ...themeState.mods[id], ...body.mods } },
      previewThemeId: id,
    };
    patchMockGlobalSettingTheme(themeState);
    return successResponse(themeState);
  }),
];
