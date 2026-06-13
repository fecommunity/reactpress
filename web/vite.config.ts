import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite-plus";
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { devPortRedirectPlugin } from "@fecommunity/reactpress-toolkit/plugin/dev";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webNodeModules = path.resolve(__dirname, "node_modules");

const toolkitSrc = path.resolve(__dirname, "../toolkit/src");
const toolkitEntry = (subpath: string) => path.join(toolkitSrc, subpath, "index.ts");
const toolkitAliases = [
  {
    find: "@reactpress-plugins",
    replacement: path.resolve(__dirname, "../plugins"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/plugin/react",
    replacement: toolkitEntry("plugin/react"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/plugin/admin",
    replacement: toolkitEntry("plugin/admin"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/plugin/dev",
    replacement: toolkitEntry("plugin/dev"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/plugin/extension",
    replacement: toolkitEntry("plugin/extension"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/theme",
    replacement: toolkitEntry("theme"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/utils",
    replacement: toolkitEntry("utils"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/ui/content",
    replacement: path.join(toolkitSrc, "ui/components/content/index.ts"),
  },
  {
    find: "@fecommunity/reactpress-toolkit/ui",
    replacement: toolkitEntry("ui"),
  },
];

export default defineConfig(({ mode: viteMode }) => {
  const env = loadEnv(viteMode, process.cwd(), "");
  const apiProxyTarget =
    process.env.VITE_DEV_API_PROXY_TARGET?.trim() ||
    env.VITE_DEV_API_PROXY_TARGET?.trim() ||
    "https://api.gaoredu.com";
  /** Dev behind nginx: `reactpress dev` sets process.env.VITE_ADMIN_BASE=/admin/ */
  const adminBase = process.env.VITE_ADMIN_BASE?.trim() || env.VITE_ADMIN_BASE?.trim() || "/";
  const adminPort = Number(
    process.env.WEB_ADMIN_PORT?.trim() ||
      env.WEB_ADMIN_PORT?.trim() ||
      process.env.PORT?.trim() ||
      "3000",
  );

  return {
    base: adminBase,
    staged: {
      "*": "vp check --fix",
    },
    lint: { options: { typeAware: true, typeCheck: false } },
    plugins: [
      tanstackRouter({
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
        routeFileIgnorePattern: "Login.*|loginHeroSlides",
      }),
      react(),
      ...(process.env.REACTPRESS_NGINX_ENTRY_URL?.trim() ? [devPortRedirectPlugin(adminPort)] : []),
    ],
    server: {
      host: true,
      port: adminPort,
      strictPort: true,
      fs: {
        allow: [path.resolve(__dirname, "..")],
      },
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    resolve: {
      // Plugin admin lives under repo `plugins/` — resolve React from web's node_modules.
      dedupe: ["react", "react-dom"],
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "src") },
        { find: "react", replacement: path.join(webNodeModules, "react") },
        { find: "react-dom", replacement: path.join(webNodeModules, "react-dom") },
        ...toolkitAliases,
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes("node_modules/antd")) {
              return "vendor-antd";
            }
            if (id.includes("@tanstack/react-router") || id.includes("@tanstack/react-query")) {
              return "vendor-tanstack";
            }
            if (id.includes("lucide-react")) {
              return "vendor-ui";
            }
          },
        },
      },
      chunkSizeWarningLimit: 1024,
    },
  };
});
