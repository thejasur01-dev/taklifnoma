import { createHash, createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  TELEGRAM_AUTH_MAX_AGE_SECONDS,
  telegramDisplayName,
  telegramSyntheticEmail,
  verifyTelegramAuth,
} from "./telegram";

const BOT_TOKEN = "123456:TEST-token";
const NOW = 1_800_000_000;

function sign(fields: Record<string, string>, token = BOT_TOKEN): Record<string, string> {
  const checkString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n");
  const secret = createHash("sha256").update(token).digest();
  return { ...fields, hash: createHmac("sha256", secret).update(checkString).digest("hex") };
}

const baseFields = {
  id: "42",
  first_name: "Aziz",
  last_name: "Karimov",
  username: "aziz",
  auth_date: String(NOW - 10),
};

describe("verifyTelegramAuth", () => {
  it("accepts correctly signed data", () => {
    const user = verifyTelegramAuth(sign(baseFields), BOT_TOKEN, NOW);
    expect(user).toMatchObject({ id: 42, first_name: "Aziz", username: "aziz" });
  });

  it("rejects data signed with another bot token", () => {
    expect(verifyTelegramAuth(sign(baseFields, "999:other"), BOT_TOKEN, NOW)).toBeNull();
  });

  it("rejects tampered fields", () => {
    const signed = sign(baseFields);
    expect(verifyTelegramAuth({ ...signed, id: "43" }, BOT_TOKEN, NOW)).toBeNull();
  });

  it("rejects injected extra fields", () => {
    const signed = sign(baseFields);
    expect(verifyTelegramAuth({ ...signed, role: "admin" }, BOT_TOKEN, NOW)).toBeNull();
  });

  it("rejects expired login data", () => {
    const old = sign({ ...baseFields, auth_date: String(NOW - TELEGRAM_AUTH_MAX_AGE_SECONDS - 1) });
    expect(verifyTelegramAuth(old, BOT_TOKEN, NOW)).toBeNull();
  });

  it("rejects malformed hash", () => {
    expect(verifyTelegramAuth({ ...baseFields, hash: "abc" }, BOT_TOKEN, NOW)).toBeNull();
  });

  it("rejects missing required fields", () => {
    const { first_name: _omit, ...rest } = baseFields;
    expect(verifyTelegramAuth(sign(rest), BOT_TOKEN, NOW)).toBeNull();
  });
});

describe("helpers", () => {
  it("builds a stable synthetic email", () => {
    expect(telegramSyntheticEmail(42)).toBe("tg42@telegram.local");
  });

  it("joins first and last name", () => {
    expect(telegramDisplayName({ first_name: "Aziz" })).toBe("Aziz");
    expect(telegramDisplayName({ first_name: "Aziz", last_name: "Karimov" })).toBe("Aziz Karimov");
  });
});
