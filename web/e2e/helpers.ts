import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/Username|用户名/).fill("admin");
  await page.getByLabel(/Password|密码/).fill("admin");
  await page.getByRole("button", { name: /Sign In|登录/ }).click();
  await expect(page).toHaveURL(/dashboard/);
}

export async function gotoUsers(page: Page) {
  await loginAsAdmin(page);
  await page.goto("/users");
  await expect(page).toHaveURL(/users/);
}
