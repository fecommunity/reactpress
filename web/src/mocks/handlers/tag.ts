import { http } from "msw";

import { successResponse, withDelay } from "../createHandler";
import { MOCK_TAGS } from "../data";

export const tagHandlers = [
  http.get("/api/tag", async () => {
    await withDelay(150);
    return successResponse(
      MOCK_TAGS.map((t) => ({
        id: t.id,
        label: t.label,
        value: t.value,
      })),
    );
  }),
];
