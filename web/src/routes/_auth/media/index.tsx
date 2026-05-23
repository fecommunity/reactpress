import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/media/')({
  component: () => <ModulePlaceholder title="媒体库" />,
});
