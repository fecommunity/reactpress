import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite-plus";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = loadEnv(mode, process.cwd(), "");
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

export default defineConfig({
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
  ],
  server: {
    host: true,
    port: adminPort,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
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
});
