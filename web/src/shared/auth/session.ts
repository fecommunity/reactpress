import { permissionsForRole } from "@fecommunity/reactpress-toolkit/admin";
import { resolveApiBaseUrl } from "@fecommunity/reactpress-toolkit/react";
import { AUTH_ENDPOINTS } from "@/api/auth";
import {
  AuthTokensSchema,
  AuthUserResponseSchema,
  PermissionsListSchema,
  UserSchema,
} from "@/api/schemas";
import { getMenuTreeForPermissions } from "@/shell/bootstrap";
import { adminMenuToSidebar } from "@/shared/menu";
import { getToolkitClient, resetToolkitClient } from "@/shared/client";
import { httpClient } from "@/utils/http";
import { API_BASE_URL } from "@/utils/constants";
import { useAuthStore } from "@/stores/auth";

export function isMockAccessToken(token: string | undefined): boolean {
  return !token || token.startsWith("mock-");
}

function redirectToLogin() {
  const base = import.meta.env.BASE_URL || "/";
  const loginPath = `${base}${base.endsWith("/") ? "" : "/"}login`.replace(/\/{2,}/g, "/");
  if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
    window.location.assign(loginPath);
  }
}

export function clearInvalidServerSession() {
  useAuthStore.getState().logout();
  resetToolkitClient();
  redirectToLogin();
}

/** Verify JWT against Nest when running with VITE_AUTH_MODE=server. */
export async function validateServerAuthSession(): Promise<void> {
  const token = useAuthStore.getState().tokens?.accessToken;
  if (isMockAccessToken(token)) {
    throw new Error("mock token");
  }
  const base = await resolveApiBaseUrl(API_BASE_URL || "/api");
  const res = await fetch(`${base}/extension/themes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    throw new Error(`validate failed: ${res.status}`);
  }
}

function mapServerUser(raw: Record<string, unknown>) {
  const role = String(raw.role ?? "admin");
  const permissions = permissionsForRole(role);
  return UserSchema.parse({
    id: String(raw.id),
    username: String(raw.name ?? raw.username ?? ""),
    avatar: (raw.avatar as string | null) ?? null,
    email: (raw.email as string | null) ?? null,
    roles: [role],
    permissions,
  });
}

/** MSW / scaffold auth endpoints. */
export async function fetchSessionFromMockApi(): Promise<void> {
  const [userBase, permissions] = await Promise.all([
    httpClient.get(AUTH_ENDPOINTS.user).then((d) => AuthUserResponseSchema.parse(d)),
    httpClient.get(AUTH_ENDPOINTS.permissions).then((d) => PermissionsListSchema.parse(d)),
  ]);
  const user = UserSchema.parse({ ...userBase, permissions });
  applySession(user, permissions);
}

/** ReactPress server: user comes from login payload; menus from Registry. */
export async function fetchSessionFromServer(
  loginPayload?: Record<string, unknown>,
): Promise<void> {
  if (loginPayload) {
    const user = mapServerUser(loginPayload);
    applySession(user, user.permissions);
    return;
  }
  await validateServerAuthSession();
  const { user } = useAuthStore.getState();
  if (user) {
    applySession(user, user.permissions);
  }
}

function applySession(user: ReturnType<typeof UserSchema.parse>, permissions: string[]) {
  const menus = adminMenuToSidebar(getMenuTreeForPermissions(permissions));
  const { setUser, setMenus } = useAuthStore.getState();
  setUser(user);
  setMenus(menus);
}

export async function loginWithServerCredentials(name: string, password: string) {
  const api = await getToolkitClient();
  const data = (await api.auth.login({
    body: { name, password },
  } as Parameters<typeof api.auth.login>[0])) as Record<string, unknown>;
  const token = String(data.token ?? "");
  const tokens = AuthTokensSchema.parse({
    accessToken: token,
    refreshToken: token,
  });
  useAuthStore.getState().setTokens(tokens);
  await fetchSessionFromServer(data);
  return tokens;
}
