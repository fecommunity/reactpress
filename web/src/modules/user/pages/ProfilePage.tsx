import { App, Avatar, Button, Form, Input, Typography, Upload } from "antd";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import formStyles from "@/shared/styles/admin-form-table.module.css";
import styles from "@/modules/user/components/profile.module.css";
import {
  updateProfile,
  updateProfilePassword,
  uploadAvatar,
  type ProfileFormValues,
} from "@/modules/user/profileApi";
import { useAuthStore } from "@/stores/auth";

type ProfileFormState = ProfileFormValues & {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type ProfileFieldProps = {
  label: string;
  description?: string;
  children: ReactNode;
};

function ProfileField({ label, description, children }: ProfileFieldProps) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        {children}
        {description ? <p className={formStyles.description}>{description}</p> : null}
      </td>
    </tr>
  );
}

function resolveProfileAvatar(
  avatarValue: string | null | undefined,
  savedAvatar: string | null | undefined,
): string | undefined {
  if (avatarValue === null) return undefined;
  const fromForm = typeof avatarValue === "string" ? avatarValue.trim() : "";
  if (fromForm) return fromForm;
  const fromUser = (savedAvatar ?? "").trim();
  return fromUser || undefined;
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [form] = Form.useForm<ProfileFormState>();
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const initialProfile = useMemo(
    () => ({
      name: user?.username ?? "",
      email: user?.email ?? "",
      avatar: user?.avatar ?? null,
    }),
    [user?.avatar, user?.email, user?.username],
  );

  useEffect(() => {
    form.setFieldsValue(initialProfile);
  }, [form, initialProfile]);

  const avatarValue = Form.useWatch("avatar", form);
  const displayAvatar = resolveProfileAvatar(avatarValue, user?.avatar);
  const displayName = Form.useWatch("name", form) ?? user?.username ?? "";

  const removeAvatar = () => {
    form.setFieldValue("avatar", null);
    message.success(t("profile.avatarRemoved"));
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (url) => {
      form.setFieldValue("avatar", url);
      message.success(t("profile.avatarUpdated"));
    },
    onError: () => message.error(t("profile.avatarUploadFailed")),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: ProfileFormState) => {
      if (!user?.id) throw new Error("Missing user id");

      const profile = await updateProfile(user.id, {
        name: values.name,
        email: values.email,
        avatar: values.avatar,
      });

      if (showPasswordFields && values.newPassword) {
        if (!values.oldPassword) {
          throw new Error("OLD_PASSWORD_REQUIRED");
        }
        if (values.newPassword !== values.confirmPassword) {
          throw new Error("PASSWORD_MISMATCH");
        }
        await updateProfilePassword(user.id, values.oldPassword, values.newPassword);
      }

      return profile;
    },
    onSuccess: (result) => {
      if (user) {
        setUser({
          ...user,
          username: result.name,
          email: result.email,
          avatar: result.avatar,
        });
      }
      if (showPasswordFields) {
        form.setFieldsValue({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordFields(false);
        message.success(t("profile.savedWithPassword"));
        return;
      }
      message.success(t("profile.savedSuccess"));
    },
    onError: (error: Error) => {
      if (error.message === "OLD_PASSWORD_REQUIRED") {
        message.error(t("profile.currentPasswordRequired"));
        return;
      }
      if (error.message === "PASSWORD_MISMATCH") {
        message.error(t("profile.passwordMismatch"));
        return;
      }
      if (showPasswordFields) {
        message.error(t("profile.passwordUpdateFailed"));
        return;
      }
      message.error(t("common.saveFailed"));
    },
  });

  const roleLabel = useMemo(() => {
    const role = user?.roles?.[0];
    if (role === "admin") return t("users.roleAdmin");
    if (role === "visitor") return t("users.roleSubscriber");
    if (role === "editor") return t("users.roleEditor");
    return user?.roles?.join(", ") ?? "—";
  }, [t, user?.roles]);

  const openPasswordFields = () => {
    setShowPasswordFields(true);
    form.setFieldsValue({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const cancelPasswordFields = () => {
    setShowPasswordFields(false);
    form.setFieldsValue({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className={styles.wrap}>
      <div className="admin-page-header">
        <Typography.Title level={2} className="admin-page-title">
          {t("profile.title")}
        </Typography.Title>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__body">
          <Form
            form={form}
            component={false}
            initialValues={initialProfile}
            onFinish={(values) => saveMutation.mutate(values)}
            onFinishFailed={() => message.warning(t("profile.formInvalid"))}
          >
            <Form.Item name="avatar" hidden>
              <Input />
            </Form.Item>

            <h2 className={styles.sectionTitle}>{t("profile.sectionIdentity")}</h2>
            <table className={formStyles.formTable}>
              <tbody>
                <ProfileField label={t("profile.username")}>
                  <Form.Item
                    name="name"
                    noStyle
                    rules={[{ required: true, message: t("users.usernameRequired") }]}
                  >
                    <Input className={formStyles.fieldInput} />
                  </Form.Item>
                </ProfileField>
                <ProfileField label={t("profile.email")}>
                  <Form.Item name="email" noStyle>
                    <Input className={formStyles.fieldInput} type="email" />
                  </Form.Item>
                </ProfileField>
                <ProfileField label={t("profile.roles")}>
                  <span className={styles.roleText}>{roleLabel}</span>
                </ProfileField>
              </tbody>
            </table>

            <h2 className={styles.sectionTitle}>{t("profile.sectionAbout")}</h2>
            <table className={formStyles.formTable}>
              <tbody>
                <ProfileField
                  label={t("profile.avatarLabel")}
                  description={t("profile.avatarHint")}
                >
                  <div className={styles.avatarCell}>
                    <Avatar
                      shape="square"
                      size={96}
                      src={displayAvatar}
                      className={styles.avatarPreview}
                    >
                      {displayName?.[0]?.toUpperCase()}
                    </Avatar>
                    <div className={styles.avatarActions}>
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          uploadAvatarMutation.mutate(file);
                          return false;
                        }}
                      >
                        <Button loading={uploadAvatarMutation.isPending}>
                          {t("profile.changeAvatar")}
                        </Button>
                      </Upload>
                      {displayAvatar ? (
                        <Button
                          type="link"
                          className={formStyles.linkButton}
                          onClick={removeAvatar}
                        >
                          {t("profile.removeAvatar")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </ProfileField>
              </tbody>
            </table>

            <h2 className={styles.sectionTitle}>{t("profile.sectionAccount")}</h2>
            <table className={formStyles.formTable}>
              <tbody>
                {!showPasswordFields ? (
                  <ProfileField label={t("profile.newPassword")}>
                    <Button onClick={openPasswordFields}>{t("profile.setPassword")}</Button>
                  </ProfileField>
                ) : (
                  <>
                    <ProfileField label={t("profile.currentPassword")}>
                      <Form.Item
                        name="oldPassword"
                        noStyle
                        rules={[{ required: true, message: t("profile.currentPasswordRequired") }]}
                      >
                        <Input.Password
                          className={formStyles.fieldInput}
                          autoComplete="current-password"
                        />
                      </Form.Item>
                    </ProfileField>
                    <ProfileField label={t("profile.newPassword")}>
                      <Form.Item
                        name="newPassword"
                        noStyle
                        rules={[
                          { required: true, message: t("profile.newPasswordRequired") },
                          { min: 6, message: t("profile.newPasswordMin") },
                        ]}
                      >
                        <Input.Password
                          className={formStyles.fieldInput}
                          autoComplete="new-password"
                        />
                      </Form.Item>
                    </ProfileField>
                    <ProfileField
                      label={t("profile.confirmPassword")}
                      description={t("profile.passwordHint")}
                    >
                      <div className={styles.passwordFieldStack}>
                        <Form.Item
                          name="confirmPassword"
                          noStyle
                          dependencies={["newPassword"]}
                          rules={[
                            { required: true, message: t("profile.confirmPasswordRequired") },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error(t("profile.passwordMismatch")));
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            className={formStyles.fieldInput}
                            autoComplete="new-password"
                          />
                        </Form.Item>
                        <div className={styles.inlineAction}>
                          <Button
                            type="link"
                            className={formStyles.linkButton}
                            onClick={cancelPasswordFields}
                          >
                            {t("profile.cancelPassword")}
                          </Button>
                        </div>
                      </div>
                    </ProfileField>
                  </>
                )}
              </tbody>
            </table>

            <p className={formStyles.submitRow}>
              <Button type="primary" loading={saveMutation.isPending} onClick={() => form.submit()}>
                {t("profile.updateProfile")}
              </Button>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
