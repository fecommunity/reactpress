import { createFileRoute } from "@tanstack/react-router";
import { PageEditorPage } from "@/modules/page/pages/PageEditorPage";

export const Route = createFileRoute("/_auth/page/editor/$id")({
  component: function EditPageRoute() {
    const { id } = Route.useParams();
    return <PageEditorPage pageId={id} />;
  },
});
