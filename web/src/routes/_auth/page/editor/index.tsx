import { createFileRoute } from "@tanstack/react-router";

import { PageEditorPage } from "@/modules/page/pages/PageEditorPage";

export const Route = createFileRoute("/_auth/page/editor/")({
  component: () => <PageEditorPage />,
});
