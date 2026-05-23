import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/data/export/')({
  component: () => <ModulePlaceholder title="数据导出" />,
});
