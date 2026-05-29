import { themeApi, unpackOne } from '@fecommunity/reactpress-toolkit/theme';

const TOKEN_KEY = 'token';

export interface AuthUser {
  name?: string;
  email?: string;
  token?: string;
  avatar?: string;
}

export function persistAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export async function loginWithPassword(name: string, password: string): Promise<AuthUser> {
  const res = await themeApi.auth.login({
    body: { name, password },
  } as never);
  const user = unpackOne<AuthUser>(res);
  if (user?.token) persistAuthToken(user.token);
  return user ?? {};
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  await themeApi.user.register({
    body: input,
  } as never);
}

export async function loginWithGithubCode(code: string): Promise<AuthUser> {
  const res = await themeApi.auth.loginWithGithub({
    body: { code },
  } as never);
  const user = unpackOne<AuthUser>(res);
  if (user?.token) persistAuthToken(user.token);
  return user ?? {};
}

export function getGithubOAuthUrl(from: string): string | null {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  if (!clientId || typeof window === 'undefined') return null;
  const redirectUri = `${window.location.origin}/login?from=${encodeURIComponent(from)}`;
  return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}
