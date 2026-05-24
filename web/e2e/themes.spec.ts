import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("Theme system flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("install, activate, preview, and customize hello-world theme", async ({ page }) => {
    await page.goto("/appearance/themes");
    await expect(page.getByRole("heading", { name: /主题|Themes/i }).first()).toBeVisible();

    const helloCard = page.getByTestId("theme-card-hello-world");
    await helloCard.hover();
    await helloCard.getByRole("button", { name: /安装|Install/i }).click();
    await expect(page.getByText(/主题已安装|Theme installed/i)).toBeVisible({ timeout: 8000 });

    await helloCard.hover();
    await helloCard.getByRole("button", { name: /启用|Activate/i }).click();
    await expect(page.getByText(/主题已启用|Theme activated/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole("heading", { name: "Hello World", level: 3 })).toBeVisible();

    await page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Hello World", level: 3 }) })
      .getByRole("button", { name: /预览|Preview/i })
      .click();
    await expect(page.getByRole("heading", { name: "Hello World", level: 4 })).toBeVisible();
    const previewFrame = page.getByTestId("theme-preview-frame");
    await expect(previewFrame).toHaveAttribute("srcdoc", /Hello World/, { timeout: 20000 });

    await page.getByRole("button", { name: /关闭|Close/i }).click();
    await expect(page).toHaveURL(/\/appearance\/themes/);

    await page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Hello World", level: 3 }) })
      .getByRole("button", { name: /自定义|Customize/i })
      .click();
    await expect(page).toHaveURL(/\/appearance\/customize/);

    const titleInput = page.getByLabel(/展示标题|Display title/i);
    await titleInput.fill("My Blog Preview");
    await page.getByRole("button", { name: /发布|Publish/i }).click();
    await expect(page.getByText(/自定义已保存|Customization saved/i)).toBeVisible({
      timeout: 8000,
    });

    const customizeFrame = page.getByTestId("theme-preview-frame");
    await expect(customizeFrame).toHaveAttribute("srcdoc", /My Blog Preview/, { timeout: 20000 });
  });
});
