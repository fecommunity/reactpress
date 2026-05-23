import { createFileRoute } from "@tanstack/react-router";
import { ExportPage } from "@/modules/data/pages/ExportPage";

export const Route = createFileRoute("/_auth/data/export/")({
  component: ExportPage,
});
