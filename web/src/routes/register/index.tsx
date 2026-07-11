import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { App, Button, Form, Input } from "antd";
import { useRef } from "react";
import { Trans } from "react-i18next";

import { LanguageSwitcher, ThemeSwitcher } from "@/components/LanguageSwitcher";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { showApiErrorToast } from "@/shared/api/getApiErrorMessage";
import { registerAccount } from "@/shared/auth/registerAccount";
import { useAuthStore } from "@/stores/auth";
import { REACTPRESS_GITHUB_URL } from "@/utils/constants";

import { LoginBrandMark } from "../login/-LoginBrandMark";
import { LoginSnapNav } from "../login/-LoginSnapNav";
import { LoginDocsHome } from "../login/docs-home";
import homeStyles from "../login/docs-home/login-docs-home.module.css";
import pageStyles from "../login/login-page.module.css";

export const Route = createFileRoute("/register/")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RegisterPage,
});

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function RegisterPage() {
  useDocumentTitle("register.title");
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useAppLocale();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await registerAccount({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
    },
    onSuccess: () => {
      message.success(t("register.success"));
      void navigate({ to: "/login", search: {} });
    },
  });

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values);
    } catch (err) {
      showApiErrorToast(message, err, t, "register.failed");
    }
  };

  return (
    <div className={pageStyles.page}>
      <header className={pageStyles.fixedToolbar}>
        <div className={pageStyles.utilities}>
          <LanguageSwitcher size={16} />
          <ThemeSwitcher size={16} />
        </div>
      </header>

      <LoginSnapNav scrollerRef={scrollerRef} authScreenLabelKey="register.scroll.screenAuth" />

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
              <LoginBrandMark
                titleKey="register.title"
                subtitleKey="register.subtitle"
                headingId="register-page-heading"
              />

              <section className={pageStyles.authCard} aria-labelledby="register-page-heading">
                <Form<RegisterFormValues>
                  className={pageStyles.authForm}
                  layout="vertical"
                  onFinish={handleRegister}
                  requiredMark={false}
                >
                  <Form.Item
                    name="username"
                    label={t("login.username")}
                    rules={[{ required: true, message: t("login.usernameRequired") }]}
                  >
                    <Input
                      id="register-username"
                      aria-label={t("login.username")}
                      placeholder={t("login.usernamePlaceholder")}
                      size="large"
                      autoComplete="username"
                      autoFocus
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label={t("register.email")}
                    rules={[
                      { required: true, message: t("register.emailRequired") },
                      { type: "email", message: t("register.emailInvalid") },
                    ]}
                  >
                    <Input
                      id="register-email"
                      aria-label={t("register.email")}
                      placeholder={t("register.emailPlaceholder")}
                      size="large"
                      autoComplete="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label={t("login.password")}
                    rules={[{ required: true, message: t("login.passwordRequired") }]}
                  >
                    <Input
                      type="password"
                      id="register-password"
                      aria-label={t("login.password")}
                      placeholder={t("login.passwordPlaceholder")}
                      size="large"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label={t("register.confirmPassword")}
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: t("login.passwordRequired") },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error(t("register.passwordMismatch")));
                        },
                      }),
                    ]}
                  >
                    <Input
                      type="password"
                      id="register-confirm-password"
                      aria-label={t("register.confirmPassword")}
                      placeholder={t("register.confirmPasswordPlaceholder")}
                      size="large"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item className={pageStyles.authSubmitItem}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={registerMutation.isPending}
                      size="large"
                    >
                      {t("register.signUp")}
                    </Button>
                  </Form.Item>
                </Form>
              </section>

              <div className={pageStyles.authMeta}>
                <p className={pageStyles.authFooter}>
                  {t("register.hasAccount")}{" "}
                  <Link to="/login" search={{}}>
                    {t("register.signInLink")}
                  </Link>
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
