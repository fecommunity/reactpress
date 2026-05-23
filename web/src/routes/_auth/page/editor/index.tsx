import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/page/editor/')({
  component: () => <ModulePlaceholder title="新建页面" />,
});
