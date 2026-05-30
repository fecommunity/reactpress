import { safeJsonParse } from '@/utils/json';

/** Zustand persist key used by the ReactPress admin (`web/src/stores/auth.ts`). */
export const ADMIN_AUTH_STORAGE_KEY = 'auth-storage';

type AdminAuthPersist = {
  state?: {
    isAuthenticated?: boolean;
    tokens?: { accessToken?: string };
    user?: {
      username?: string;
      name?: string;
      email?: string | null;
      avatar?: string | null;
    };
  };
};

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const themeToken = window.localStorage.getItem('token');
  if (themeToken) return themeToken;

  try {
    const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminAuthPersist;
    return parsed.state?.tokens?.accessToken ?? null;
  } catch {
    return null;
  }
}

function mapAdminUserToThemeUser(
  adminUser: NonNullable<AdminAuthPersist['state']>['user'],
  token: string,
): IUser | null {
  if (!adminUser || !token) return null;

  const name = (adminUser.username || adminUser.name || '').trim();
  if (!name) return null;

  return {
    name,
    email: adminUser.email ?? '',
    avatar: adminUser.avatar ?? '',
    token,
  };
}

/** Resolve theme user from theme storage, or fall back to admin `auth-storage`. */
export function resolveStoredUser(): IUser | null {
  if (typeof window === 'undefined') return null;

  const userStr = window.localStorage.getItem('user');
  if (userStr) {
    const parsed = safeJsonParse(userStr) as Partial<IUser>;
    if (parsed?.name) {
      const token = getStoredAccessToken();
      return {
        name: parsed.name,
        email: parsed.email ?? '',
        avatar: parsed.avatar ?? '',
        token: parsed.token ?? token ?? '',
        role: parsed.role,
      };
    }
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminAuthPersist;
    const { state } = parsed;
    if (!state?.isAuthenticated) return null;
    const token = state.tokens?.accessToken;
    if (!token) return null;
    return mapAdminUserToThemeUser(state.user, token);
  } catch {
    return null;
  }
}

export function persistThemeSession(user: IUser): void {
  if (typeof window === 'undefined') return;
  if (user.token) {
    window.localStorage.setItem('token', user.token);
  }
  window.localStorage.setItem('user', JSON.stringify(user));
}

export function clearThemeSession(): void {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem('user');
  window.localStorage.removeItem('token');
  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}
