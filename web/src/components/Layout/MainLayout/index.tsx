import { Layout } from "antd";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { normalizeAppPath } from "@/utils/appMenu";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";
import "../admin-layout.css";

const { Content } = Layout;

export function MainLayout() {
  useDocumentTitle();
  const { pathname } = useLocation();
  const isThemePreview = normalizeAppPath(pathname).startsWith("/appearance/themes/preview");

  if (isThemePreview) {
    return <Outlet />;
  }

  return (
    <Layout className="admin-shell">
      <Header />
      <Layout className="admin-shell__body">
        <Sidebar />
        <Content className="main-layout-main">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
