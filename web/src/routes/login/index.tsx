import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Form, Input, Button, App, Space } from "antd";
import { useMutation } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { httpClient } from "@/utils/http";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { AUTH_ENDPOINTS } from "@/api/auth";
import { LoginRequestSchema, AuthTokensSchema } from "@/api/schemas";
import { fetchSessionFromMockApi, loginWithServerCredentials } from "@/shared/auth/session";
import { getLoginErrorMessage } from "@/shared/auth/loginErrorMessage";
import { AUTH_MODE, REACTPRESS_GITHUB_URL, reactpressDocsPath } from "@/utils/constants";
import type { LoginRequest } from "@/api/schemas";
import { Theme } from "@/components/Icon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useMinWidth } from "@/hooks/useMinWidth";
import { LoginBrandMark } from "./LoginBrandMark";
import { LoginHeroPanel } from "./LoginHeroPanel";
import { LoginMobileShowcase } from "./LoginMobileShowcase";
import pageStyles from "./login-page.module.css";

export const Route = createFileRoute("/login/")({
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
  const { message } = App.useApp();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const setTokens = useAuthStore((s) => s.setTokens);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const isWide = useMinWidth(900);

  const docsUrl = reactpressDocsPath(locale, "/docs/tutorial-basics/start");

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
      message.error(getLoginErrorMessage(err, t));
    },
  });

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.shell}>
        <LoginHeroPanel />

        <div className={pageStyles.mobileHero}>
          <p className={pageStyles.mobileHeroTagline}>{t("login.showcase.tagline")}</p>
        </div>

        <LoginMobileShowcase />

        <div className={pageStyles.authColumn}>
          <header className={pageStyles.authToolbar}>
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

          <main className={pageStyles.authMain}>
            <div className={pageStyles.authStack}>
              <LoginBrandMark />

              <section className={pageStyles.authCard} aria-labelledby="login-page-heading">
                <Form
                  className={pageStyles.authForm}
                  layout="vertical"
                  onFinish={(values) => {
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
                      autoFocus={isWide}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={t("login.password")}
                    rules={[{ required: true, message: t("login.passwordRequired") }]}
                  >
                    <Input.Password
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
        </div>
      </div>
    </div>
  );
}
