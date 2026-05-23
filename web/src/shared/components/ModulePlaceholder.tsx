import { Card, Typography } from 'antd';

interface ModulePlaceholderProps {
  title: string;
  description?: string;
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {description ?? '该模块页面已挂载，业务 UI 将在此迭代。'}
      </Typography.Paragraph>
    </Card>
  );
}
