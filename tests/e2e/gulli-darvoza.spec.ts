import { expect, test } from "@playwright/test";
import uz from "../../messages/uz.json" with { type: "json" };

const inv = uz.invitation;

test.describe("Gulli darvoza template", () => {
  test("is the first card in the catalog and opens its preview", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("#templates ul > li").first();
    await expect(firstCard).toContainText(uz.templateNames["gulli-darvoza"]);
    await firstCard.getByRole("link").click();
    await expect(page).toHaveURL(/\/templates\/gulli-darvoza$/);
    await expect(page.getByRole("button", { name: inv.open })).toBeVisible();
  });

  test("opens straight to the invitation under reduced motion and validates RSVP", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/templates/gulli-darvoza");
    await page.getByRole("button", { name: inv.open }).click();

    await expect(page.getByText(inv.bismillah)).toBeVisible();
    await expect(page.getByRole("heading", { name: inv.rsvpTitle })).toBeVisible();

    const form = page.locator("main form");
    await form.getByRole("button", { name: inv.submit }).click();
    await expect(form.getByRole("alert").filter({ hasText: inv.nameRequired })).toBeVisible();
    await expect(form.getByRole("alert").filter({ hasText: inv.choiceRequired })).toBeVisible();

    await form.getByLabel(inv.name).fill("Jasur aka");
    await form.getByRole("button", { name: inv.attending }).click();
    await form.getByRole("button", { name: inv.submit }).click();
    await expect(page.getByRole("status").filter({ hasText: inv.thanksYes })).toBeVisible();
  });

  test("links the venue to Yandex Maps", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/templates/gulli-darvoza");
    await page.getByRole("button", { name: inv.open }).click();
    await expect(page.getByRole("link", { name: inv.openMap })).toHaveAttribute(
      "href",
      /^https:\/\/yandex\.uz\/maps\/\?text=/,
    );
  });
});
