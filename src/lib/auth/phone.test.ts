import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone, phoneSyntheticEmail } from "./phone";

describe("normalizePhone", () => {
  it.each([
    ["+998 90 123 45 67", "+998901234567"],
    ["+998901234567", "+998901234567"],
    ["998901234567", "+998901234567"],
    ["90 123-45-67", "+998901234567"],
    ["(90) 123 45 67", "+998901234567"],
    ["+7 916 123 45 67", "+79161234567"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["", "abc", "12345", "+998 90 123 45", "+998 90 123 45 678", "8 916 123 45 67", "+1234"])(
    "rejects %s",
    (input) => {
      expect(normalizePhone(input)).toBeNull();
    },
  );
});

describe("formatPhone", () => {
  it("groups Uzbek numbers", () => {
    expect(formatPhone("+998901234567")).toBe("+998 90 123 45 67");
  });

  it("leaves foreign numbers untouched", () => {
    expect(formatPhone("+79161234567")).toBe("+79161234567");
  });
});

describe("phoneSyntheticEmail", () => {
  it("is stable and digit-only", () => {
    expect(phoneSyntheticEmail("+998901234567")).toBe("p998901234567@phone.local");
  });
});
