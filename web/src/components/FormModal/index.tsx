import { Form, Modal, theme } from "antd";
import type { FormInstance } from "antd/es/form";
import type { ReactNode } from "react";

export type BaseFormModalProps<TValues> = {
  open: boolean;
  title: ReactNode;
  okText: ReactNode;
  cancelText: ReactNode;
  form: FormInstance<TValues>;
  confirmLoading?: boolean;
  onCancel: () => void;
  onFinish: (values: TValues) => void;
  children: ReactNode;
};

export function BaseFormModal<TValues>({
  open,
  title,
  okText,
  cancelText,
  form,
  confirmLoading,
  onCancel,
  onFinish,
  children,
}: BaseFormModalProps<TValues>) {
  const { token } = theme.useToken();

  return (
    <Modal
      centered
      title={title}
      open={open}
      okText={okText}
      cancelText={cancelText}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      styles={{
        body: {
          paddingTop: token.padding,
        },
      }}
    >
      <Form form={form} layout="vertical" scrollToFirstError onFinish={onFinish}>
        {children}
      </Form>
    </Modal>
  );
}
