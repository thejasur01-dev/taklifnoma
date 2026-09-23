import { describe, expect, it } from "vitest";
import { invitationUrl, shareLinks } from "./share";
import { isValidSlug, randomSlug, slugFromNames } from "./slug";

describe("slug", () => {
  it.each(["akmal-madina", "k7m2p9qx", "abc"])("accepts %s", (slug) => {
    expect(isValidSlug(slug)).toBe(true);
  });

  it.each(["ab", "-abc", "abc-", "a--b", "Akmal", "aziz_madina", "a".repeat(41)])("rejects %s", (slug) => {
    expect(isValidSlug(slug)).toBe(false);
  });

  it("generates valid random slugs", () => {
    for (let i = 0; i < 50; i++) expect(isValidSlug(randomSlug())).toBe(true);
  });

  it("builds a slug from names, dropping Uzbek apostrophes", () => {
    expect(slugFromNames("Akmal", "Madina")).toBe("akmal-madina");
    expect(slugFromNames("Gʻayrat", "Oʻgʻiloy")).toBe("gayrat-ogiloy");
    expect(slugFromNames("  ", "Madina")).toBe("madina");
  });
});

describe("share", () => {
  it("builds messenger links", () => {
    const links = shareLinks("https://taklifnoma.uz/i/akmal-madina", "Taklif:");
    expect(links.telegram).toBe(
      "https://t.me/share/url?url=https%3A%2F%2Ftaklifnoma.uz%2Fi%2Fakmal-madina&text=Taklif%3A",
    );
    expect(links.whatsapp).toBe(
      "https://wa.me/?text=Taklif%3A%20https%3A%2F%2Ftaklifnoma.uz%2Fi%2Fakmal-madina",
    );
  });

  it("builds the public invitation URL", () => {
    expect(invitationUrl("https://taklifnoma.uz/", "akmal-madina")).toBe(
      "https://taklifnoma.uz/i/akmal-madina",
    );
  });
});
