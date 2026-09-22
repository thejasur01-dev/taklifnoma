import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { asAnon, asUser, createTestDb, createUser } from "./harness";

let db: PGlite;
let alice: string;
let bob: string;
let admin: string;
let templateId: string;
let aliceInvitation: string;

async function insertInvitation(ownerId: string, slug: string): Promise<string> {
  const res = await db.query<{ id: string }>(
    "insert into public.invitations (owner_id, template_id, slug) values ($1, $2, $3) returning id",
    [ownerId, templateId, slug],
  );
  return res.rows[0]!.id;
}

beforeAll(async () => {
  db = await createTestDb({ seed: true });
  alice = await createUser(db, { full_name: "Alice", locale: "ru" });
  bob = await createUser(db);
  admin = await createUser(db);
  await db.query("update public.profiles set role = 'admin' where id = $1", [admin]);

  const t = await db.query<{ id: string }>("select id from public.templates order by sort limit 1");
  templateId = t.rows[0]!.id;
  aliceInvitation = await insertInvitation(alice, "alice-wedding");
  await insertInvitation(bob, "bob-wedding");
}, 60_000);

describe("schema & triggers", () => {
  it("seeds 6 templates", async () => {
    const res = await db.query<{ n: number }>("select count(*)::int as n from public.templates");
    expect(res.rows[0]!.n).toBe(6);
  });

  it("creates a profile for every new auth user with metadata", async () => {
    const res = await db.query<{ full_name: string; locale: string; role: string }>(
      "select full_name, locale, role from public.profiles where id = $1",
      [alice],
    );
    expect(res.rows[0]).toEqual({ full_name: "Alice", locale: "ru", role: "customer" });
  });

  it("generates short unambiguous guest codes", async () => {
    const res = await db.query<{ code: string }>(
      "insert into public.guests (invitation_id, name) values ($1, 'Aziz aka') returning code",
      [aliceInvitation],
    );
    expect(res.rows[0]!.code).toMatch(/^[abcdefghjkmnpqrstuvwxyz23456789]{7}$/);
  });

  it.each(["admin", "api", "dashboard"])("rejects reserved slug %s", async (slug) => {
    await expect(insertInvitation(alice, slug)).rejects.toThrow(/slug_reserved/);
  });

  it.each(["ab", "-abc", "abc-", "a--b", "Aziz", "aziz_madina", "a".repeat(41)])(
    "rejects invalid slug %s",
    async (slug) => {
      await expect(insertInvitation(alice, slug)).rejects.toThrow(/check constraint/);
    },
  );

  it("rejects percent promo codes above 100", async () => {
    await expect(
      db.query("insert into public.promo_codes (code, type, value) values ('BIG', 'percent', 150)"),
    ).rejects.toThrow(/check constraint/);
  });

  it("bumps updated_at on invitation update", async () => {
    const before = await db.query<{ updated_at: Date }>(
      "select updated_at from public.invitations where id = $1",
      [aliceInvitation],
    );
    await db.query("update public.invitations set data = '{\"v\":1}' where id = $1", [aliceInvitation]);
    const after = await db.query<{ updated_at: Date }>(
      "select updated_at from public.invitations where id = $1",
      [aliceInvitation],
    );
    expect(after.rows[0]!.updated_at.getTime()).toBeGreaterThanOrEqual(before.rows[0]!.updated_at.getTime());
  });
});

describe("RLS: anonymous visitors", () => {
  it("can read active templates", async () => {
    const n = await asAnon(db, async (tx) => (await tx.query("select id from public.templates")).rows.length);
    expect(n).toBe(6);
  });

  it("cannot read invitations, guests, rsvps or profiles", async () => {
    for (const table of ["invitations", "guests", "rsvps", "wishes", "profiles", "orders"]) {
      const n = await asAnon(db, async (tx) => (await tx.query(`select 1 from public.${table}`)).rows.length);
      expect(n, table).toBe(0);
    }
  });

  it("cannot write rsvps directly (must go through rate-limited server)", async () => {
    await expect(
      asAnon(db, (tx) =>
        tx.query("insert into public.rsvps (invitation_id, name, status) values ($1, 'x', 'yes')", [
          aliceInvitation,
        ]),
      ),
    ).rejects.toThrow(/row-level security/);
  });
});

describe("RLS: customers", () => {
  it("see only their own invitations", async () => {
    const slugs = await asUser(db, alice, async (tx) =>
      (await tx.query<{ slug: string }>("select slug from public.invitations")).rows.map((r) => r.slug),
    );
    expect(slugs).toEqual(["alice-wedding"]);
  });

  it("can create a draft but not an active invitation", async () => {
    await asUser(db, alice, (tx) =>
      tx.query("insert into public.invitations (owner_id, template_id, slug) values ($1, $2, 'alice-osh')", [
        alice,
        templateId,
      ]),
    );
    await expect(
      asUser(db, alice, (tx) =>
        tx.query(
          "insert into public.invitations (owner_id, template_id, slug, status) values ($1, $2, 'alice-free', 'active')",
          [alice, templateId],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("cannot create an invitation on behalf of someone else", async () => {
    await expect(
      asUser(db, alice, (tx) =>
        tx.query("insert into public.invitations (owner_id, template_id, slug) values ($1, $2, 'fake-bob')", [
          bob,
          templateId,
        ]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("can edit content but cannot activate the invitation (payment bypass)", async () => {
    await asUser(db, alice, (tx) =>
      tx.query('update public.invitations set data = \'{"names":"A & B"}\' where id = $1', [aliceInvitation]),
    );
    await expect(
      asUser(db, alice, (tx) =>
        tx.query("update public.invitations set status = 'active' where id = $1", [aliceInvitation]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot promote themselves to admin", async () => {
    await expect(
      asUser(db, alice, (tx) => tx.query("update public.profiles set role = 'admin' where id = $1", [alice])),
    ).rejects.toThrow(/permission denied/);
    await asUser(db, alice, (tx) =>
      tx.query("update public.profiles set full_name = 'Alisa' where id = $1", [alice]),
    );
  });

  it("cannot touch another customer's invitation", async () => {
    const updated = await asUser(
      db,
      bob,
      async (tx) =>
        (
          await tx.query("update public.invitations set data = '{}' where id = $1 returning id", [
            aliceInvitation,
          ])
        ).rows.length,
    );
    expect(updated).toBe(0);
  });

  it("can manage guests only on own invitations", async () => {
    await asUser(db, alice, (tx) =>
      tx.query("insert into public.guests (invitation_id, name) values ($1, 'Madina opa')", [
        aliceInvitation,
      ]),
    );
    await expect(
      asUser(db, bob, (tx) =>
        tx.query("insert into public.guests (invitation_id, name) values ($1, 'Spy')", [aliceInvitation]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("can moderate wishes (visibility only) on own invitation", async () => {
    const res = await db.query<{ id: string }>(
      "insert into public.wishes (invitation_id, author_name, message) values ($1, 'Guest', 'Congrats!') returning id",
      [aliceInvitation],
    );
    const wishId = res.rows[0]!.id;
    await asUser(db, alice, (tx) =>
      tx.query("update public.wishes set is_visible = false where id = $1", [wishId]),
    );
    await expect(
      asUser(db, alice, (tx) =>
        tx.query("update public.wishes set message = 'edited' where id = $1", [wishId]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot read promo codes", async () => {
    await db.query("insert into public.promo_codes (code, type, value) values ('WELCOME10', 'percent', 10)");
    const n = await asUser(
      db,
      alice,
      async (tx) => (await tx.query("select 1 from public.promo_codes")).rows.length,
    );
    expect(n).toBe(0);
  });
});

describe("RLS: admins", () => {
  it("see every invitation", async () => {
    const n = await asUser(
      db,
      admin,
      async (tx) => (await tx.query("select 1 from public.invitations")).rows.length,
    );
    expect(n).toBeGreaterThanOrEqual(3);
  });

  it("see promo codes", async () => {
    const n = await asUser(
      db,
      admin,
      async (tx) => (await tx.query("select 1 from public.promo_codes")).rows.length,
    );
    expect(n).toBe(1);
  });
});

describe("plans & phone auth (0002)", () => {
  it("defaults orders to the standard plan", async () => {
    const res = await db.query<{ plan: string }>(
      "insert into public.orders (user_id, amount_uzs, provider) values ($1, 100000, 'manual') returning plan",
      [alice],
    );
    expect(res.rows[0]!.plan).toBe("standard");
  });

  it("allows one account per phone number", async () => {
    await db.query("update public.profiles set phone = '+998901234567' where id = $1", [alice]);
    await expect(
      db.query("update public.profiles set phone = '+998901234567' where id = $1", [bob]),
    ).rejects.toThrow(/duplicate key/);
  });

  it("hides phone verifications from customers and anonymous visitors", async () => {
    await db.query(
      "insert into public.phone_verifications (phone, request_id) values ('+998901234567', 'r1')",
    );
    await expect(asAnon(db, (tx) => tx.query("select 1 from public.phone_verifications"))).rejects.toThrow(
      /permission denied/,
    );
    await expect(
      asUser(db, alice, (tx) => tx.query("select 1 from public.phone_verifications")),
    ).rejects.toThrow(/permission denied/);
  });
});
