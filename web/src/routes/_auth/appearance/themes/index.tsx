import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/appearance/themes/')({
  component: () => <ModulePlaceholder title="主题管理" description="安装、激活与发布主题（extension API）。" />,
});
