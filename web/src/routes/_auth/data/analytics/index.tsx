import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/data/analytics/')({
  component: () => <ModulePlaceholder title="访问统计" />,
});
