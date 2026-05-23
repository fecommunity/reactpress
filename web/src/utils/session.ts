import {
  fetchSessionFromMockApi,
  fetchSessionFromServer,
  loginWithServerCredentials,
} from '@/shared/auth/session';

export { fetchSessionFromMockApi, fetchSessionFromServer, loginWithServerCredentials };

export async function fetchSessionAndApplyToStore(): Promise<void> {
  const mode = import.meta.env.VITE_AUTH_MODE ?? 'mock';
  if (mode === 'server') {
    await fetchSessionFromServer();
    return;
  }
  await fetchSessionFromMockApi();
}
