import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsPage } from "@/modules/data/pages/AnalyticsPage";

export const Route = createFileRoute("/_auth/data/analytics/")({
  component: AnalyticsPage,
});
