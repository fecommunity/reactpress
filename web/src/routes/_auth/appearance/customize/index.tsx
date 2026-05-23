import { createFileRoute } from "@tanstack/react-router";
import { CustomizePage } from "@/modules/appearance/pages/CustomizePage";

export const Route = createFileRoute("/_auth/appearance/customize/")({
  component: CustomizePage,
});
