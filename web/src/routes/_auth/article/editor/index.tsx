import { createFileRoute } from '@tanstack/react-router';
import { ModulePlaceholder } from '@/shared/components/ModulePlaceholder';

export const Route = createFileRoute('/_auth/article/editor/')({
  component: () => (
    <ModulePlaceholder title="写文章" description="富文本编辑器将在此接入（React.lazy 懒加载）。" />
  ),
});
