import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import type { CreateUserRequest, User } from "@/api/schemas";
import { useTranslation } from "react-i18next";
import { BaseFormModal } from "@/components/FormModal";

export type FormModalProps = {
  open: boolean;
  editingUser: User | null;
  form: FormInstance<CreateUserRequest>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: CreateUserRequest) => void;
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

  return (
    <BaseFormModal<CreateUserRequest>
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
      <Form.Item
        name="roles"
        label={t("common.roles")}
        rules={[{ required: true, message: t("users.rolesRequired") }]}
      >
        <Select
          mode="multiple"
          options={[
            { label: t("users.roleAdmin"), value: "admin" },
            { label: t("users.roleEditor"), value: "editor" },
          ]}
        />
      </Form.Item>
      <Form.Item name="email" label={t("common.email")}>
        <Input />
      </Form.Item>
    </BaseFormModal>
  );
}
