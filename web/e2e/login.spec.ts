import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByLabel(/Username|用户名/)).toBeVisible();
    await expect(page.getByLabel(/Password|密码/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In|登录/ })).toBeVisible();
  });

  test("should login successfully with admin/admin", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText("Total Revenue")).toBeVisible();
  });

  test("should show error for wrong credentials", async ({ page }) => {
    await page.getByLabel(/Username|用户名/).fill("wrong");
    await page.getByLabel(/Password|密码/).fill("wrong");
    await page.getByRole("button", { name: /Sign In|登录/ }).click();

    await expect(page.getByText("Invalid username or password")).toBeVisible();
  });
});
