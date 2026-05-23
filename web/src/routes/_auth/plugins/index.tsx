import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/plugins/')({
  component: () => <ModulePlaceholder title="插件" />,
});
