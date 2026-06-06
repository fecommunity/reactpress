'use client';

import { UserProvider } from '@/lib/providers/client';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { resolveImageUrl, useSiteUser } from '@fecommunity/reactpress-toolkit/theme';
import { useCallback, useState } from 'react';

function resolveAdminHref(): string {
  const configured = process.env.NEXT_PUBLIC_REACTPRESS_ADMIN_URL?.trim();
  if (configured) return configured.endsWith('/') ? configured : `${configured}/`;
  if (typeof window !== 'undefined') return `${window.location.origin}/admin/`;
  return 'http://localhost/admin/';
}

export default function UserAuth() {
  const { t } = useLocale();
  const { user, setUser, removeUser } = useSiteUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [menuOpen, setMenuOpen] = useState(false);

  const submitLogin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await UserProvider.login({ email: form.email, password: form.password });
      setUser(res);
      setLoginOpen(false);
    } finally {
      setLoading(false);
    }
  }, [form.email, form.password, setUser]);

  const submitRegister = useCallback(async () => {
    if (form.password !== form.confirm) return;
    setLoading(true);
    try {
      const res = await UserProvider.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setUser(res);
      setRegisterOpen(false);
    } finally {
      setLoading(false);
    }
  }, [form, setUser]);

  if (user?.name) {
    const initial = user.name.trim().charAt(0).toUpperCase();
    return (
      <div className="relative">
        <button
          type="button"
          aria-label={user.name}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent p-0"
        >
          {user.avatar ? (
            <img
              src={resolveImageUrl(user.avatar, 'avatar')}
              alt={user.name}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#fde3cf] text-xs font-medium leading-none text-[#f56a00]">
              {initial}
            </span>
          )}
        </button>
        {menuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 cursor-default border-0 bg-transparent p-0"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-2 min-w-[120px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-box)] py-1 shadow-[var(--box-shadow)]">
              <a
                href={resolveAdminHref()}
                target="_blank"
                rel="noreferrer"
                className="block px-4 py-2 text-sm text-[var(--main-text-color)] no-underline hover:bg-[var(--bg-second)]"
                onClick={() => setMenuOpen(false)}
              >
                {user.name}
              </a>
              <button
                type="button"
                onClick={() => {
                  removeUser?.();
                  setMenuOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--main-text-color)] hover:bg-[var(--bg-second)]"
              >
                {t('logout')}
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="flex overflow-hidden rounded-md border border-[var(--border-color)]">
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="px-3 py-1.5 text-sm text-[var(--main-text-color)] hover:bg-[var(--bg-second)]"
        >
          {t('userInfoConfirm')}
        </button>
        <button
          type="button"
          onClick={() => setRegisterOpen(true)}
          className="border-l border-[var(--border-color)] px-3 py-1.5 text-sm text-[var(--main-text-color)] hover:bg-[var(--bg-second)]"
        >
          {t('register')}
        </button>
      </div>

      {loginOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-[var(--bg-box)] p-6 shadow-xl">
            <h3 className="mt-0 text-lg font-semibold">{t('userInfoConfirm')}</h3>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t('commentNamespace.userInfoEmail')}
              className="mt-4 w-full rounded-md border border-[var(--border-color)] px-3 py-2"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder={t('commentNamespace.userInfoPassword')}
              className="mt-3 w-full rounded-md border border-[var(--border-color)] px-3 py-2"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setLoginOpen(false)} className="px-4 py-2 text-sm">
                {t('userInfoCancel')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={submitLogin}
                className="rounded-md bg-[var(--primary-color)] px-4 py-2 text-sm text-white"
              >
                {loading ? t('loading') : t('userInfoConfirm')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {registerOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-[var(--bg-box)] p-6 shadow-xl">
            <h3 className="mt-0 text-lg font-semibold">{t('userRegister')}</h3>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('commentNamespace.userInfoName')}
              className="mt-4 w-full rounded-md border border-[var(--border-color)] px-3 py-2"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t('commentNamespace.userInfoEmail')}
              className="mt-3 w-full rounded-md border border-[var(--border-color)] px-3 py-2"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder={t('commentNamespace.userInfoPassword')}
              className="mt-3 w-full rounded-md border border-[var(--border-color)] px-3 py-2"
            />
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))}
              placeholder={t('userInfoPleaseEnterConfirmPassword')}
              className="mt-3 w-full rounded-md border border-[var(--border-color)] px-3 py-2"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRegisterOpen(false)} className="px-4 py-2 text-sm">
                {t('userInfoCancel')}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={submitRegister}
                className="rounded-md bg-[var(--primary-color)] px-4 py-2 text-sm text-white"
              >
                {loading ? t('loading') : t('register')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
