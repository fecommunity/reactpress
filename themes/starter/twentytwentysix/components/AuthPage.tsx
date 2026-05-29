'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DoubleColumnLayout from '../components/DoubleColumnLayout';
import SystemNotice from '../components/SystemNotice';
import ThemeShell from '../components/ThemeShell';
import { useThemeT } from '../hooks/useThemeT';
import {
  getGithubOAuthUrl,
  loginWithGithubCode,
  loginWithPassword,
  registerUser,
} from '../lib/auth';

type AuthMode = 'login' | 'register';

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const t = useThemeT();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const code = typeof router.query.code === 'string' ? router.query.code : '';
    const from = typeof router.query.from === 'string' ? router.query.from : '/';
    if (mode !== 'login' || !code) return;

    let cancelled = false;
    loginWithGithubCode(code)
      .then(() => {
        if (!cancelled) router.replace(from || '/');
      })
      .catch(() => {
        if (!cancelled) setError(t('auth.githubFailed', 'GitHub 登录失败，请重试。'));
      });
    return () => {
      cancelled = true;
    };
  }, [mode, router, t]);

  const redirectAfterAuth = () => {
    const from = typeof router.query.from === 'string' ? router.query.from : '/';
    router.replace(from || '/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithPassword(name.trim(), password);
      redirectAfterAuth();
    } catch {
      setError(t('auth.loginFailed', '登录失败，请检查用户名和密码。'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError(t('auth.passwordMismatch', '两次输入的密码不一致。'));
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
      router.replace('/login?from=/');
    } catch {
      setError(t('auth.registerFailed', '注册失败，请稍后重试。'));
    } finally {
      setSubmitting(false);
    }
  };

  const githubUrl = getGithubOAuthUrl(
    typeof router.query.from === 'string' ? router.query.from : '/',
  );

  const isLogin = mode === 'login';
  const title = isLogin ? t('auth.login', '登录') : t('auth.register', '注册');

  return (
    <ThemeShell head={<title>{title}</title>}>
      <DoubleColumnLayout
        top={<SystemNotice />}
        main={
          <div className="widget-card auth-card">
            <h1 className="auth-card-title">{title}</h1>
            {error ? <p className="auth-error">{error}</p> : null}
            <form
              className="auth-form"
              onSubmit={isLogin ? handleLogin : handleRegister}
            >
              <label className="auth-field">
                <span>{t('auth.username', '用户名')}</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="username"
                />
              </label>
              {!isLogin ? (
                <label className="auth-field">
                  <span>{t('auth.email', '邮箱')}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>
              ) : null}
              <label className="auth-field">
                <span>{t('auth.password', '密码')}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </label>
              {!isLogin ? (
                <label className="auth-field">
                  <span>{t('auth.confirmPassword', '确认密码')}</span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </label>
              ) : null}
              <button type="submit" className="btn-primary auth-submit" disabled={submitting}>
                {title}
              </button>
            </form>

            {isLogin ? (
              <p className="auth-switch">
                {t('auth.noAccount', '还没有账号？')}
                <Link href="/register">{t('auth.registerNow', '立即注册')}</Link>
              </p>
            ) : (
              <p className="auth-switch">
                {t('auth.hasAccount', '已有账号？')}
                <Link href="/login">{t('auth.login', '登录')}</Link>
              </p>
            )}

            {isLogin && githubUrl ? (
              <div className="auth-oauth">
                <p className="auth-oauth-label">{t('auth.oauth', '第三方登录')}</p>
                <a href={githubUrl} className="auth-github-btn">
                  GitHub
                </a>
              </div>
            ) : null}
          </div>
        }
      />
    </ThemeShell>
  );
}
