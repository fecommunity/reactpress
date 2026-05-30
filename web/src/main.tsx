import "dashicons/dashicons.css";
import "@/i18n";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";

import i18n from "@/i18n";

import { routeTree } from "./routeTree.gen";
import {
  clearInvalidServerSession,
  isMockAccessToken,
  validateServerAuthSession,
} from "./shared/auth/session";
import { hasAdminConsoleAccess } from "./shared/auth/adminAccess";
import { adminMenuToSidebar } from "./shared/menu";
import { bootstrapAdmin, getMenuTreeForPermissions } from "./shell/bootstrap";
import { useAuthStore } from "./stores/auth";
import { useSettingsStore } from "./stores/settings";
import { AUTH_MODE } from "./utils/constants";
import { fetchSessionAndApplyToStore } from "./utils/session";

const routerBase =
  import.meta.env.BASE_URL && import.meta.env.BASE_URL !== "/"
    ? import.meta.env.BASE_URL.replace(/\/$/, "")
    : undefined;

const router = createRouter({
  routeTree,
  ...(routerBase ? { basepath: routerBase } : {}),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function unregisterMockServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((reg) => reg.active?.scriptURL.includes("mockServiceWorker.js"))
      .map((reg) => reg.unregister()),
  );
}

async function enableMocking() {
  const enableMockInBuild = import.meta.env.VITE_ENABLE_MOCK === "true";
  const disableMockInDev = import.meta.env.VITE_ENABLE_MOCK === "false";
  if (disableMockInDev) {
    await unregisterMockServiceWorker();
    return;
  }
  if (!import.meta.env.DEV && !enableMockInBuild) return;
  const { worker } = await import("./mocks/browser");
  const swUrl = `${import.meta.env.BASE_URL}mockServiceWorker.js`.replace(/\/{2,}/g, "/");
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: swUrl },
  });
}

enableMocking()
  .then(async () => {
    bootstrapAdmin();
    await useAuthStore.persist.rehydrate();
    await useSettingsStore.persist.rehydrate();
    const { locale } = useSettingsStore.getState();
    await i18n.changeLanguage(locale);
    const { isAuthenticated, tokens, user } = useAuthStore.getState();

    if (isAuthenticated && user && !hasAdminConsoleAccess(user)) {
      useAuthStore.getState().logout();
    } else if (AUTH_MODE === "server" && isAuthenticated) {
      if (isMockAccessToken(tokens?.accessToken)) {
        clearInvalidServerSession();
      } else {
        try {
          await validateServerAuthSession();
          const currentUser = useAuthStore.getState().user;
          if (currentUser?.permissions?.length) {
            useAuthStore
              .getState()
              .setMenus(adminMenuToSidebar(getMenuTreeForPermissions(currentUser.permissions)));
          }
        } catch {
          clearInvalidServerSession();
        }
      }
    } else if (user?.permissions?.length) {
      useAuthStore
        .getState()
        .setMenus(adminMenuToSidebar(getMenuTreeForPermissions(user.permissions)));
    } else if (isAuthenticated && tokens) {
      try {
        await fetchSessionAndApplyToStore();
      } catch {
        useAuthStore.getState().logout();
      }
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>,
    );
  })
  .catch((err) => {
    console.error("Failed to initialize app:", err);
  });
