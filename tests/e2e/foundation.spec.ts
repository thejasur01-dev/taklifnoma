import { expect, test } from "@playwright/test";
import en from "../../messages/en.json" with { type: "json" };
import ru from "../../messages/ru.json" with { type: "json" };
import uz from "../../messages/uz.json" with { type: "json" };

/** Rich-text messages contain tags like <em>; the rendered heading does not. */
const plain = (s: string) => s.replace(/<[^>]+>/g, "");

test.describe("i18n routing", () => {
  test("serves Uzbek at the root without a prefix", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "uz");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(plain(uz.home.hero.title));
  });

  test("serves Russian and English under a prefix", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(plain(ru.home.hero.title));
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(plain(en.home.hero.title));
  });

  test("switches language and keeps the current page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(uz.localeSwitcher.label).selectOption("ru");
    await expect(page).toHaveURL(/\/ru\/login$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(ru.auth.title);
  });

  test("shows a localized 404 page", async ({ page }) => {
    const response = await page.goto("/ru/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(ru.errors.notFoundTitle);
  });
});

test.describe("home page", () => {
  test("live demo updates the invitation as you type", async ({ page }) => {
    await page.goto("/#demo");
    const demo = page.locator("#demo");
    await demo.getByLabel(uz.home.demo.firstName).fill("Jasur");
    await expect(demo.getByText("Jasur", { exact: true })).toBeVisible();
  });

  test("filters templates by ceremony", async ({ page }) => {
    await page.goto("/");
    const catalog = page.locator("#templates");
    await catalog.getByRole("button", { name: uz.ceremony.xatna, exact: true }).click();
    await expect(catalog.getByRole("button", { name: new RegExp(uz.templateNames.sahro) })).toBeVisible();
    await expect(catalog.getByRole("button", { name: new RegExp(uz.templateNames.lojuvard) })).toHaveCount(0);
  });
});

test.describe("auth", () => {
  test("redirects anonymous visitors from the dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(uz.auth.title);
  });

  test("validates the phone number before sending a code", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(uz.auth.phoneLabel).fill("12345");
    await page.getByRole("button", { name: uz.auth.sendCode }).click();
    await expect(page.getByRole("alert").filter({ hasText: uz.auth.errors.invalidPhone })).toBeVisible();
    await expect(page.getByLabel(uz.auth.phoneLabel)).toHaveAttribute("aria-invalid", "true");
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
