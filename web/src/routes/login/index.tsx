import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { App, Button, Form, Input, Space } from "antd";
import { useEffect, useRef } from "react";
import { Trans } from "react-i18next";

import { AUTH_ENDPOINTS } from "@/api/auth";
import type { LoginRequest } from "@/api/schemas";
import { AuthTokensSchema, LoginRequestSchema } from "@/api/schemas";
import { Theme } from "@/components/Icon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AdminAccessDeniedError } from "@/shared/auth/adminAccess";
import { getLoginErrorMessage } from "@/shared/auth/loginErrorMessage";
import { fetchSessionFromMockApi, loginWithServerCredentials } from "@/shared/auth/session";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { AUTH_MODE, REACTPRESS_GITHUB_URL, reactpressDocsPath } from "@/utils/constants";
import { httpClient } from "@/utils/http";

import { LoginBrandMark } from "./-LoginBrandMark";
import { LoginSnapNav } from "./-LoginSnapNav";
import { LoginDocsHome } from "./docs-home";
import homeStyles from "./docs-home/login-docs-home.module.css";
import pageStyles from "./login-page.module.css";

type LoginSearch = {
  reason?: string;
};

export const Route = createFileRoute("/login/")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    reason: typeof search.reason === "string" ? search.reason : undefined,
  }),
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  useDocumentTitle("login.title");
  const navigate = useNavigate();
  const { reason } = Route.useSearch();
  const { message } = App.useApp();
  const { t } = useAppLocale();
  const locale = useSettingsStore((s) => s.locale);
  const setTokens = useAuthStore((s) => s.setTokens);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const docsUrl = reactpressDocsPath(locale, "/docs/tutorial-basics/start");

  useEffect(() => {
    if (reason === "adminRequired") {
      message.warning(t("login.adminAccessRequired"));
    }
  }, [message, reason, t]);

  const loginMutation = useMutation({
    mutationFn: async (values: LoginRequest) => {
      const parsed = LoginRequestSchema.parse(values);
      if (AUTH_MODE === "server") {
        await loginWithServerCredentials(parsed.username, parsed.password);
        return;
      }
      const tokens = await httpClient.post(AUTH_ENDPOINTS.login, parsed);
      const validTokens = AuthTokensSchema.parse(tokens);
      setTokens(validTokens);
      await fetchSessionFromMockApi();
    },
    onSuccess: () => {
      message.success(t("login.success"));
      void navigate({ to: "/dashboard" });
    },
    onError: (err) => {
      const text = getLoginErrorMessage(err, t);
      if (
        err instanceof AdminAccessDeniedError ||
        text === t("login.adminAccessRequired") ||
        text === t("login.tooManyAttempts")
      ) {
        message.warning(text);
        return;
      }
      message.error(text);
    },
  });

  return (
    <div className={pageStyles.page}>
      <header className={pageStyles.fixedToolbar}>
        <Space size={4} className={pageStyles.utilities}>
          <LanguageSwitcher size="small" compact />
          <Button
            type="text"
            size="small"
            onClick={toggleDarkMode}
            icon={<Theme size={16} />}
            aria-label={t("common.toggleTheme")}
          />
        </Space>
      </header>

      <LoginSnapNav scrollerRef={scrollerRef} />

      <div
        className={`${pageStyles.snapScroller} ${homeStyles.themeScope}`}
        data-login-snap-root
        ref={scrollerRef}
      >
        <section
          className={`${pageStyles.snapScreen} ${pageStyles.screenAuth}`}
          data-login-screen="auth"
        >
          <main className={pageStyles.authMain}>
            <div className={pageStyles.authStack}>
              <LoginBrandMark />

              <section className={pageStyles.authCard} aria-labelledby="login-page-heading">
                <Form
                  className={pageStyles.authForm}
                  layout="vertical"
                  onFinish={(values: unknown) => {
                    loginMutation.mutate(LoginRequestSchema.parse(values));
                  }}
                  requiredMark={false}
                >
                  <Form.Item
                    name="username"
                    label={t("login.username")}
                    rules={[{ required: true, message: t("login.usernameRequired") }]}
                  >
                    <Input
                      id="login-username"
                      aria-label={t("login.username")}
                      placeholder={t("login.usernamePlaceholder")}
                      size="large"
                      autoComplete="username"
                      autoFocus
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={t("login.password")}
                    rules={[{ required: true, message: t("login.passwordRequired") }]}
                  >
                    <Input
                      type="password"
                      id="login-password"
                      aria-label={t("login.password")}
                      placeholder={t("login.passwordPlaceholder")}
                      size="large"
                      autoComplete="current-password"
                    />
                  </Form.Item>

                  <Form.Item className={pageStyles.authSubmitItem}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loginMutation.isPending}
                      size="large"
                    >
                      {t("login.signIn")}
                    </Button>
                  </Form.Item>
                </Form>
              </section>

              <div className={pageStyles.authMeta}>
                <p className={pageStyles.authFooter}>
                  {t("login.noAccount")} <Link to="/register">{t("login.signUpLink")}</Link>
                </p>
                <p className={pageStyles.authFooter}>
                  {t("login.authFooterPrefix")}{" "}
                  <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                    {t("login.authFooterDocs")}
                  </a>{" "}
                  {t("login.authFooterSuffix")}
                </p>
              </div>
            </div>
          </main>

          <footer className={pageStyles.pageFooter}>
            <p className={pageStyles.poweredBy}>
              <Trans
                i18nKey="login.poweredBy"
                components={{
                  1: <a href={REACTPRESS_GITHUB_URL} target="_blank" rel="noopener noreferrer" />,
                }}
              />
            </p>
          </footer>
        </section>

        <LoginDocsHome />
      </div>
    </div>
  );
}
