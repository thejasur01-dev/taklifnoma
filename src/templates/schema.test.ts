import { describe, expect, it } from "vitest";
import { invitationDataSchema, mapLink, timeUntil } from "./schema";

const valid = {
  hosts: { first: "Akmal", second: "Madina" },
  message: "Sizni toʻyimizga taklif etamiz.",
  families: "Karimovlar va Rahimovlar oilalari",
  event: {
    startsAt: "2026-10-17T18:00:00+05:00",
    venueName: "Navroʻz saroyi",
    address: "Toshkent, Amir Temur shoh koʻchasi, 1",
  },
};

describe("invitationDataSchema", () => {
  it("accepts valid data and defaults showBismillah to true", () => {
    const parsed = invitationDataSchema.parse(valid);
    expect(parsed.showBismillah).toBe(true);
  });

  it("rejects empty names and dates without a timezone offset", () => {
    expect(invitationDataSchema.safeParse({ ...valid, hosts: { first: " ", second: "M" } }).success).toBe(
      false,
    );
    expect(
      invitationDataSchema.safeParse({ ...valid, event: { ...valid.event, startsAt: "2026-10-17T18:00:00" } })
        .success,
    ).toBe(false);
  });
});

describe("timeUntil", () => {
  const target = new Date("2026-10-17T18:00:00+05:00");

  it("splits the remaining time into days, hours and minutes", () => {
    const now = new Date("2026-10-15T15:30:30+05:00");
    expect(timeUntil(target, now)).toEqual({ days: 2, hours: 2, minutes: 29, started: false });
  });

  it("reports started once the event time has passed", () => {
    expect(timeUntil(target, new Date("2026-10-17T18:00:00+05:00")).started).toBe(true);
    expect(timeUntil(target, new Date("2026-10-18T10:00:00+05:00"))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      started: true,
    });
  });
});

describe("mapLink", () => {
  it("prefers a custom link", () => {
    expect(mapLink({ ...valid.event, mapUrl: "https://yandex.uz/maps/-/CDabc" })).toBe(
      "https://yandex.uz/maps/-/CDabc",
    );
  });

  it("builds a Yandex search from venue and address", () => {
    expect(mapLink(valid.event)).toBe(
      `https://yandex.uz/maps/?text=${encodeURIComponent("Navroʻz saroyi, Toshkent, Amir Temur shoh koʻchasi, 1")}`,
    );
  });
});
