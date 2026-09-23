import { expect, test } from "@playwright/test";
import uz from "../../messages/uz.json" with { type: "json" };

const inv = uz.invitation;

test.describe("catalog and template pages", () => {
  test("Gulli darvoza is the first card, with View and Order actions", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("#templates ul > li").first();
    await expect(firstCard).toContainText(uz.templateNames["gulli-darvoza"]);
    await expect(firstCard.getByRole("link", { name: new RegExp(uz.catalog.order) })).toHaveAttribute(
      "href",
      "/create/gulli-darvoza",
    );
    await firstCard.getByRole("link", { name: new RegExp(uz.catalog.view) }).click();
    await expect(page).toHaveURL(/\/templates\/gulli-darvoza$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(uz.templateNames["gulli-darvoza"]);
    await expect(page.getByText(uz.templatePage.includesTitle)).toBeVisible();
    await expect(page.getByRole("link", { name: uz.templatePage.fullscreen })).toHaveAttribute(
      "href",
      "/templates/gulli-darvoza/full",
    );
  });

  test("ordering without an account leads to login and back to the order", async ({ page }) => {
    await page.goto("/templates/anor");
    await page.getByRole("link", { name: uz.templatePage.order }).click();
    await expect(page).toHaveURL(/\/login\?next=\/create\/anor$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(uz.auth.title);
  });

  test("full screen demo opens and validates RSVP (reduced motion skips the video)", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/templates/gulli-darvoza/full");
    await page.getByRole("button", { name: inv.open }).click();

    await expect(page.getByText(inv.bismillah)).toBeVisible();
    await expect(page.getByRole("heading", { name: inv.rsvpTitle })).toBeVisible();
    await expect(page.getByRole("link", { name: inv.openMap })).toHaveAttribute(
      "href",
      /^https:\/\/yandex\.uz\/maps\/\?text=/,
    );

    const form = page.locator("main form");
    await form.getByRole("button", { name: inv.submit }).click();
    await expect(form.getByRole("alert").filter({ hasText: inv.nameRequired })).toBeVisible();

    await form.getByLabel(inv.name).fill("Jasur aka");
    await form.getByRole("button", { name: inv.attending }).click();
    await form.getByRole("button", { name: inv.submit }).click();
    await expect(page.getByRole("status").filter({ hasText: inv.thanksYes })).toBeVisible();
    await expect(page.getByText(inv.demoNotice)).toBeVisible();
  });

  test("themed templates open into the shared sections", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/templates/zumrad-tun/full");
    await page.getByRole("button", { name: inv.open }).click();
    await expect(page.getByText(inv.dateTitle)).toBeVisible();
    await expect(page.getByRole("heading", { name: inv.rsvpTitle })).toBeVisible();
  });
});

test.describe("guest invitation pages", () => {
  test("unknown invitations return 404 with a friendly message", async ({ page }) => {
    const response = await page.goto("/i/bunday-taklifnoma-yoq");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(inv.unavailableTitle);
  });

  test("the editor requires login", async ({ page }) => {
    await page.goto("/dashboard/00000000-0000-0000-0000-000000000000");
    await expect(page).toHaveURL(/\/login$/);
  });
});
