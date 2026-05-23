import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/appearance/customize/')({
  component: () => <ModulePlaceholder title="站点定制" />,
});
