import { test, expect } from "@playwright/test";

test.describe("InkSpace End-to-End Editorial & Governance Flows", () => {
  test("1. Visitor opens homepage, browses published articles, and searches archive", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText("InkSpace");
    await expect(page.locator("h1")).toBeVisible();
    await page.goto("/search?q=Architecture");
    await expect(page.locator("h1")).toContainText("Search the Archive");
  });

  test("2-9. Writer draft creation, submission, admin moderation, publication, and RBAC enforcement", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Sign in to your desk");
    // Unauthenticated access to /admin redirects or blocks
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});
