import { test, expect } from "@playwright/test";
import { gotoUsers, loginAsAdmin } from "./helpers";

test.describe("User Management", () => {
  test.beforeEach(async ({ page }) => {
    await gotoUsers(page);
  });

  test("should display user table", async ({ page }) => {
    const thead = page.locator(".ant-table-thead");
    await expect(thead.getByText(/Username|用户名/)).toBeVisible();
    await expect(thead.getByText(/Email|邮箱/)).toBeVisible();
    await expect(thead.getByText(/Roles|角色/)).toBeVisible();
  });

  test("should search users", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search User|搜索用户/);
    await searchInput.fill("zhao.ming");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/keyword=zhao\.ming/);
    /* Avoid strict-mode match on email cell containing substring "zhao.ming" */
    await expect(page.getByText("zhao.ming", { exact: true })).toBeVisible();
  });

  test("should open create user modal", async ({ page }) => {
    await page.getByRole("button", { name: /Create User|创建用户/ }).click();
    await expect(page.getByRole("dialog").getByText(/New User|新建用户/)).toBeVisible();
  });
});

/** Avoid a second full `page.goto` after `/users`: reload can land on login before auth rehydrates. */
test.describe("User Management — role in URL", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/users?role=admin");
    await expect(page.getByPlaceholder(/Search User|搜索用户/)).toBeVisible({ timeout: 15_000 });
  });

  test("should filter users by role", async ({ page }) => {
    await expect(page).toHaveURL(/role=admin/);
    await expect(page.getByRole("cell", { name: "ops.admin@northstar.io" })).toBeVisible();
  });
});
