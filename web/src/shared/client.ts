import type { ReactPressClient } from "@fecommunity/reactpress-toolkit/plugin/react";
import { createClient, resolveApiBaseUrl } from "@fecommunity/reactpress-toolkit/plugin/react";

import { useAuthStore } from "@/stores/auth";
import { API_BASE_URL } from "@/utils/constants";

let client: ReactPressClient | null = null;

export async function getToolkitClient(): Promise<ReactPressClient> {
  if (client) return client;

  const baseURL = await resolveApiBaseUrl(API_BASE_URL || "/api");
  client = createClient({
    baseURL,
    getAccessToken: () => useAuthStore.getState().tokens?.accessToken ?? null,
    onUnauthorized: () => {
      useAuthStore.getState().logout();
    },
  });
  return client;
}

export function resetToolkitClient() {
  client = null;
}
