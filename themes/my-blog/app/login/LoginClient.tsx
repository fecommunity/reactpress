'use client';

import { UserProvider } from '@/src/providers';
import { useLocale } from '@fecommunity/reactpress-toolkit/ui';
import { useSiteSetting, useSiteUser } from '@fecommunity/reactpress-toolkit/theme';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface LoginClientProps {
  code: string;
  from: string;
}

export default function LoginClient({ code, from }: LoginClientProps) {
  const { t } = useLocale();
  const { setUser } = useSiteUser();
  const setting = useSiteSetting();
  const router = useRouter();

  useEffect(() => {
    if (!code) return;
    UserProvider.loginWithGithub(code)
      .then((res) => {
        setUser(res);
        router.replace(from || '/');
      })
      .catch(() => {
        router.replace('/');
      });
  }, [code, from, router, setUser]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--primary-color)]"
        role="status"
        aria-label={t('logingWithGithub')}
      />
      <p className="text-sm text-[var(--second-text-color)]">
        {t('logingWithGithub')} — {setting.systemTitle}
      </p>
    </div>
  );
}
