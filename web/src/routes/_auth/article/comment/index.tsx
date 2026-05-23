import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/article/comment/')({
  component: () => <ModulePlaceholder title="评论管理" />,
});
