import { describe, expect, it } from "vitest";
import { CODE_MAX_PER_HOUR, evaluateSendLimit } from "./rate-limit";

const NOW = new Date("2026-09-23T12:00:00Z");
const ago = (seconds: number) => new Date(NOW.getTime() - seconds * 1000);

describe("evaluateSendLimit", () => {
  it("allows the first code", () => {
    expect(evaluateSendLimit([], NOW)).toEqual({ allowed: true });
  });

  it("blocks a resend within 60 seconds and says how long to wait", () => {
    expect(evaluateSendLimit([ago(20)], NOW)).toEqual({ allowed: false, retryAfterSeconds: 40 });
  });

  it("allows a resend after 60 seconds", () => {
    expect(evaluateSendLimit([ago(61)], NOW)).toEqual({ allowed: true });
  });

  it("caps codes per hour", () => {
    const sends = Array.from({ length: CODE_MAX_PER_HOUR }, (_, i) => ago(300 + i * 300));
    const result = evaluateSendLimit(sends, NOW);
    expect(result.allowed).toBe(false);
    // The oldest send (1500 s ago) leaves the window in 2100 s.
    expect(result).toEqual({ allowed: false, retryAfterSeconds: 2100 });
  });

  it("ignores sends older than an hour", () => {
    const old = Array.from({ length: 10 }, (_, i) => ago(3700 + i));
    expect(evaluateSendLimit(old, NOW)).toEqual({ allowed: true });
  });
});
