import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite-plus";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import react from "@vitejs/plugin-react-swc";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = loadEnv(mode, process.cwd(), "");
const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET?.trim() || "https://api.gaoredu.com";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: { options: { typeAware: true, typeCheck: false } },
  plugins: [
    tanstackRouter({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
  ],
  server: {
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
      "@fecommunity/reactpress-toolkit/admin": path.resolve(
        __dirname,
        "../toolkit/src/admin/index.ts",
      ),
      "@fecommunity/reactpress-toolkit/react": path.resolve(
        __dirname,
        "../toolkit/src/react/index.ts",
      ),
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
