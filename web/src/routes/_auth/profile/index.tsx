import { createFileRoute } from '@tanstack/react-router';
import { Card, Descriptions } from 'antd';
import { useAuthStore } from '@/stores/auth';

export const Route = createFileRoute('/_auth/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  return (
    <Card title="个人资料">
      <Descriptions column={1} size="small">
        <Descriptions.Item label="用户名">{user?.username ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{user?.email ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="角色">{user?.roles?.join(', ') ?? '—'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
