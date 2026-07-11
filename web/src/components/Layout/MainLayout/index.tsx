import "../admin-layout.css";

import { Outlet, useLocation } from "@tanstack/react-router";
import { Layout } from "antd";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { PluginAdminProvider } from "@/shell/PluginAdminProvider";
import { normalizeAppPath } from "@/utils/appMenu";

import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

const { Content } = Layout;

export function MainLayout() {
  useDocumentTitle();
  const { pathname } = useLocation();
  const appPath = normalizeAppPath(pathname);
  const isFullscreenAppearance =
    appPath.startsWith("/appearance/themes/preview") || appPath === "/appearance/customize";

  if (isFullscreenAppearance) {
    return <Outlet />;
  }

  return (
    <PluginAdminProvider>
      <Layout className="admin-shell">
        <Header />
        <Layout className="admin-shell__body">
          <Sidebar />
          <Content className="main-layout-main">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </PluginAdminProvider>
  );
}
