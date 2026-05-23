import React from "react";
import ReactDOM from "react-dom/client";
import "@/i18n";
import i18n from "@/i18n";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useSettingsStore } from "./stores/settings";
import { routeTree } from "./routeTree.gen";
import { bootstrapAdmin, getMenuTreeForPermissions } from "./shell/bootstrap";
import { adminMenuToSidebar } from "./shared/menu";
import { useAuthStore } from "./stores/auth";
import { fetchSessionAndApplyToStore } from "./utils/session";

const router = createRouter({ routeTree });

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
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}

enableMocking()
  .then(async () => {
    bootstrapAdmin();
    await useAuthStore.persist.rehydrate();
    await useSettingsStore.persist.rehydrate();
    const { locale } = useSettingsStore.getState();
    await i18n.changeLanguage(locale);
    const { isAuthenticated, tokens } = useAuthStore.getState();
    const { user } = useAuthStore.getState();
    if (user?.permissions?.length) {
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
