import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirect";

describe("safeRedirectPath", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/ru/dashboard?tab=guests", "/ru/dashboard?tab=guests"],
  ])("keeps relative path %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  it.each([null, undefined, "", "https://evil.com", "//evil.com", "/\\evil.com", "dashboard"])(
    "falls back for unsafe value %s",
    (input) => {
      expect(safeRedirectPath(input)).toBe("/dashboard");
    },
  );
});
