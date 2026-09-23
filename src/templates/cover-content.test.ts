import { describe, expect, it } from "vitest";
import { type CalendarNames, DEMO_EVENT_DATE, formatCoverDate } from "./cover-content";

const uz: CalendarNames = {
  weekdays: ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"],
  months: [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ],
};

describe("formatCoverDate", () => {
  it("formats in Tashkent time with the given names", () => {
    expect(formatCoverDate(DEMO_EVENT_DATE, uz)).toEqual({
      weekday: "shanba",
      day: "17",
      month: "oktabr",
      year: "2026",
      monthYear: "oktabr 2026",
      time: "17:00",
    });
  });

  it("rolls over to the next day after 19:00 UTC", () => {
    // 20:30 UTC is 01:30 on Sunday in Tashkent.
    expect(formatCoverDate(new Date("2026-10-17T20:30:00Z"), uz)).toMatchObject({
      weekday: "yakshanba",
      day: "18",
      time: "01:30",
    });
  });

  it("handles year boundaries", () => {
    expect(formatCoverDate(new Date("2026-12-31T19:05:00Z"), uz).monthYear).toBe("yanvar 2027");
  });
});
