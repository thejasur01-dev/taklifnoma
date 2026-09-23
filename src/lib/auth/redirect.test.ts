import { describe, expect, it } from "vitest";
import { safeNextPath } from "./redirect";

describe("safeNextPath", () => {
  it.each(["/create/gulli-darvoza", "/dashboard", "/templates/anor?x=1"])("keeps %s", (path) => {
    expect(safeNextPath(path)).toBe(path);
  });

  it.each([
    null,
    undefined,
    "",
    "dashboard",
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "/a b",
    "/<script>",
  ])("rejects %s", (path) => {
    expect(safeNextPath(path)).toBeNull();
  });
});
