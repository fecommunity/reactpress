import { http } from "msw";
import { MOCK_CATEGORIES } from "../data";
import { withDelay, successResponse } from "../createHandler";

export const categoryHandlers = [
  http.get("/api/category", async () => {
    await withDelay(150);
    return successResponse(
      MOCK_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        value: c.value,
      })),
    );
  }),
];
