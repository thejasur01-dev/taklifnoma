import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite, type Transaction } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const SUPABASE_DIR = path.resolve(__dirname, "../../supabase");

/**
 * Minimal emulation of what Supabase provides before user migrations run:
 * auth schema, auth.uid(), API roles and default privileges on `public`.
 */
const SUPABASE_BOOTSTRAP = `
  create schema if not exists extensions;
  create schema if not exists auth;

  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );

  create function auth.uid() returns uuid
  language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

  grant usage on schema public, auth, extensions to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;

  alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

export async function createTestDb(options: { seed?: boolean } = {}): Promise<PGlite> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec(SUPABASE_BOOTSTRAP);

  const migrationsDir = path.join(SUPABASE_DIR, "migrations");
  for (const file of readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await db.exec(readFileSync(path.join(migrationsDir, file), "utf8"));
  }
  if (options.seed) {
    await db.exec(readFileSync(path.join(SUPABASE_DIR, "seed.sql"), "utf8"));
  }
  return db;
}

export async function createUser(db: PGlite, meta: Record<string, string> = {}): Promise<string> {
  const res = await db.query<{ id: string }>(
    "insert into auth.users (raw_user_meta_data) values ($1) returning id",
    [JSON.stringify(meta)],
  );
  const id = res.rows[0]?.id;
  if (!id) throw new Error("failed to create auth user");
  return id;
}

type Role = "anon" | "authenticated";

/** Runs `fn` inside a transaction as the given API role (and user, if any). */
export async function as<T>(
  db: PGlite,
  role: Role,
  userId: string | null,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [userId ?? ""]);
    await tx.exec(`set local role ${role}`);
    return fn(tx);
  });
}

export const asUser = <T>(db: PGlite, userId: string, fn: (tx: Transaction) => Promise<T>) =>
  as(db, "authenticated", userId, fn);

export const asAnon = <T>(db: PGlite, fn: (tx: Transaction) => Promise<T>) => as(db, "anon", null, fn);
