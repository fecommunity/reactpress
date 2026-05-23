import { createFileRoute } from "@tanstack/react-router";
import { ImportPage } from "@/modules/data/pages/ImportPage";

export const Route = createFileRoute("/_auth/data/import/")({
  component: ImportPage,
});
