import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasAdminConsoleAccess } from "@/shared/auth/adminAccess";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useAuthStore } from "@/stores/auth";
import { canAccessPath, normalizeAppPath } from "@/utils/appMenu";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated, user, logout } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: "/login", search: {} });
    }

    if (!hasAdminConsoleAccess(user)) {
      logout();
      throw redirect({ to: "/login", search: { reason: "adminRequired" } });
    }

    const path = normalizeAppPath(location.pathname);
    if (path === "/403") return;

    if (!canAccessPath(location.pathname, user?.permissions)) {
      throw redirect({ to: "/403" });
    }
  },
  component: MainLayout,
});
