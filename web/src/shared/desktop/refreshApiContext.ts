import { isDesktopRuntime } from "@/shared/desktop/apiConfig";
import { isElectronFileProtocol } from "@/shared/desktop/electronRouting";
import { resetToolkitClient } from "@/shared/client";
import { queryClient } from "@/shared/queryClient";
import { useAuthStore } from "@/stores/auth";

/** Drop cached API data after the desktop backend URL or mode changes. */
export async function resetDesktopApiCache(): Promise<void> {
  resetToolkitClient();
  await queryClient.cancelQueries();
  queryClient.clear();
}

function redirectToLoginPage(): void {
  if (typeof window === "undefined") return;
  if (isElectronFileProtocol()) {
    window.location.hash = "#/login";
    window.location.reload();
    return;
  }
  window.location.reload();
}

type ApplyDesktopApiContextOptions = {
  /** Log out and reload the SPA (needed when switching API backends while signed in). */
  restartApp?: boolean;
};

/**
 * Desktop API mode/URL changed. Clear cached queries and optionally restart the SPA so
 * lists and settings reload from the new backend without a manual full refresh.
 */
export async function applyDesktopApiContextChange(
  options: ApplyDesktopApiContextOptions = {},
): Promise<void> {
  if (!isDesktopRuntime()) return;

  const { restartApp = false } = options;
  await resetDesktopApiCache();

  if (restartApp) {
    if (useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().logout();
    }
    redirectToLoginPage();
    return;
  }

  await queryClient.refetchQueries({ type: "active" });
}
