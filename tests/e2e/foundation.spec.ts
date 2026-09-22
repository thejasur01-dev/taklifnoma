import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import ru from "../../messages/ru.json" with { type: "json" };
import uz from "../../messages/uz.json" with { type: "json" };

test.describe("i18n routing", () => {
  test("serves Uzbek at the root without a prefix", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "uz");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(uz.home.title);
  });

  test("serves Russian and English under a prefix", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(ru.home.title);
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.home.title);
  });

  test("switches language and keeps the current page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(uz.localeSwitcher.label).selectOption("ru");
    await expect(page).toHaveURL(/\/ru\/login$/);
    await expect(page.getByText(ru.auth.title, { exact: true })).toBeVisible();
  });

  test("shows a localized 404 page", async ({ page }) => {
    const response = await page.goto("/ru/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(ru.errors.notFoundTitle);
  });
});

test.describe("auth", () => {
  test("redirects anonymous visitors from the dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText(uz.auth.title, { exact: true })).toBeVisible();
  });

  test("validates the email before sending a code", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(uz.auth.emailLabel).fill("not-an-email");
    await page.getByRole("button", { name: uz.auth.sendCode }).click();
    await expect(page.getByRole("alert").filter({ hasText: uz.auth.errors.invalidEmail })).toBeVisible();
    await expect(page.getByLabel(uz.auth.emailLabel)).toHaveAttribute("aria-invalid", "true");
  });

  test("login page is not indexed", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("layout & headers", () => {
  test("has no horizontal scroll", async ({ page }) => {
    for (const path of ["/", "/login"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("sends security headers and noindex for invitation pages", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["x-content-type-options"]).toBe("nosniff");
    expect(home.headers()["x-powered-by"]).toBeUndefined();

    const invitation = await request.get("/i/some-slug");
    expect(invitation.headers()["x-robots-tag"]).toContain("noindex");
  });
});
