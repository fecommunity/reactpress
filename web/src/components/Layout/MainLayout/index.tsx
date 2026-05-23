import { Layout } from "antd";
import { Outlet } from "@tanstack/react-router";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";
import "../admin-layout.css";

const { Content } = Layout;

export function MainLayout() {
  useDocumentTitle();

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
