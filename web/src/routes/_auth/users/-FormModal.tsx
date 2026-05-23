import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import type { User } from "@/api/schemas";
import { useTranslation } from "react-i18next";
import { BaseFormModal } from "@/components/FormModal";
import { AUTH_MODE } from "@/utils/constants";

export type UserFormValues = {
  username: string;
  email?: string | null;
  role: string;
  password?: string;
};

export type FormModalProps = {
  open: boolean;
  editingUser: User | null;
  form: FormInstance<UserFormValues>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: UserFormValues) => void;
};

export function FormModal({
  open,
  editingUser,
  form,
  confirmLoading,
  onCancel,
  onFinish,
}: FormModalProps) {
  const { t } = useTranslation();
  const isServer = AUTH_MODE === "server";

  return (
    <BaseFormModal<UserFormValues>
      open={open}
      title={editingUser ? t("users.editUser") : t("users.newUser")}
      okText={t("common.ok")}
      cancelText={t("common.cancel")}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        label={t("common.username")}
        rules={[{ required: true, message: t("users.usernameRequired") }]}
      >
        <Input />
      </Form.Item>
      {!editingUser && isServer ? (
        <Form.Item
          name="password"
          label={t("login.password")}
          rules={[{ required: true, message: t("users.passwordRequired") }]}
        >
          <Input.Password />
        </Form.Item>
      ) : null}
      <Form.Item
        name="role"
        label={t("common.roles")}
        rules={[{ required: true, message: t("users.rolesRequired") }]}
      >
        <Select
          options={[
            { label: t("users.roleAdmin"), value: "admin" },
            { label: t("users.roleSubscriber"), value: "visitor" },
            ...(isServer ? [] : [{ label: t("users.roleEditor"), value: "editor" }]),
          ]}
        />
      </Form.Item>
      <Form.Item name="email" label={t("common.email")}>
        <Input />
      </Form.Item>
    </BaseFormModal>
  );
}
