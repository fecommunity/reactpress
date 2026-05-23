import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/page/')({
  component: () => <ModulePlaceholder title="固定页面" />,
});
