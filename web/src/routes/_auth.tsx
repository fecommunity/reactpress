import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { MainLayout } from "@/components/Layout/MainLayout";
import { canAccessPath, normalizeAppPath } from "@/utils/appMenu";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    const path = normalizeAppPath(location.pathname);
    if (path === "/403") return;

    if (!canAccessPath(location.pathname, user?.permissions)) {
      throw redirect({ to: "/403" });
    }
  },
  component: MainLayout,
});
