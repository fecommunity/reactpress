import { createFileRoute } from '@tanstack/react-router';
import { App, Button, Card, Form, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import { getToolkitClient } from '@/shared/client';

export const Route = createFileRoute('/_auth/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const saveMutation = useMutation({
    mutationFn: async (values: { name: string; email: string }) => {
      const api = await getToolkitClient();
      await api.user.update({
        body: { name: values.name, email: values.email },
      } as Parameters<typeof api.user.update>[0]);
      return values;
    },
    onSuccess: (values) => {
      if (user) {
        setUser({ ...user, username: values.name, email: values.email });
      }
      message.success(t('profile.savedSuccess'));
    },
    onError: () => message.error(t('common.saveFailed')),
  });

  return (
    <Card title={t('profile.title')}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: user?.username ?? '', email: user?.email ?? '' }}
        onFinish={(values) => saveMutation.mutate(values)}
      >
        <Form.Item name="name" label={t('profile.username')} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label={t('profile.email')}>
          <Input />
        </Form.Item>
        <Form.Item label={t('profile.roles')}>
          <Input disabled value={user?.roles?.join(', ') ?? '—'} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
            {t('common.save')}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
