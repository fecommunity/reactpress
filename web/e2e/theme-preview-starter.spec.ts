import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers";

const PREVIEW_URL = "/appearance/themes/preview?theme=reactpress-theme-starter";
const MAX_MS = 10_000;

test.describe("Theme preview — reactpress-theme-starter", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("loads live preview within 10s (3 consecutive navigations)", async ({ page }) => {
    for (const run of [1, 2, 3]) {
      const started = Date.now();
      await page.goto(PREVIEW_URL, { waitUntil: "domcontentloaded" });

      const frame = page.getByTestId("theme-preview-frame");
      await expect(frame).toBeAttached({ timeout: MAX_MS });
      await expect(frame).toHaveAttribute("data-preview-mode", "live", { timeout: MAX_MS });
      await expect(frame).toHaveAttribute("src", /^http:\/\/localhost:3001\//, { timeout: MAX_MS });

      const preview = page.frameLocator('[data-testid="theme-preview-frame"]');
      await expect(preview.locator("body")).toBeVisible({ timeout: MAX_MS });

      const elapsed = Date.now() - started;
      expect(elapsed, `run ${run} exceeded ${MAX_MS}ms`).toBeLessThanOrEqual(MAX_MS);

      await page.waitForTimeout(300);
    }
  });
});
