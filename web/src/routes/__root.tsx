import "@/index.css";
import "@/shared/styles/editor-theme.css";
import "@/shared/styles/markdown.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { App, ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useLayoutEffect } from "react";

import { NotFound } from "@/components/NotFound";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useSettingsStore } from "@/stores/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function RootComponent() {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const locale = useSettingsStore((s) => s.locale);
  const configProviderProps = useAppTheme();
  const antdLocale = locale === "zh" ? zhCN : enUS;

  useLayoutEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider {...configProviderProps} locale={antdLocale}>
        <App>
          <Outlet />
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
