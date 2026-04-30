import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRYPTO_SALT = process.env.CRYPTO_SALT;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY environment variables",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function applyFilters(query: any, filters: Record<string, any>) {
  return Object.entries(filters).reduce((currentQuery, [key, value]) => {
    if (value === undefined) {
      return currentQuery;
    }

    if (value === null) {
      return currentQuery.is(key, null);
    }

    if (Array.isArray(value)) {
      return currentQuery.in(key, value);
    }

    return currentQuery.eq(key, value);
  }, query);
}

export async function selectAll<T = any>(
  table: string,
  filters: Record<string, any> = {},
  order?: { column: string; ascending?: boolean },
): Promise<T[]> {
  let query: any = supabase.from<any, any>(table).select("*");
  query = applyFilters(query, filters);

  if (order) {
    query = query.order(order.column, {
      ascending: order.ascending ?? true,
    });
  }

  const { data, error } = await query;
  if (error) {
    console.error("[v0] selectAll error:", error);
    throw error;
  }
  return data ?? [];
}

export async function selectOne<T = any>(
  table: string,
  filters: Record<string, any> = {},
): Promise<T | null> {
  let query: any = supabase.from<any, any>(table).select("*").maybeSingle();
  query = applyFilters(query, filters);

  const { data, error } = await query;
  if (error) {
    console.error("[v0] selectOne error:", error);
    throw error;
  }
  return data;
}

export async function insert<T = any>(
  table: string,
  record: Record<string, any>,
): Promise<T | null> {
  const { data, error } = await supabase.from<any, any>(table).insert([record]).select().single();
  if (error) {
    console.error("[v0] insert error:", error);
    throw error;
  }
  return data;
}

export async function update<T = any>(
  table: string,
  filters: Record<string, any>,
  updates: Record<string, any>,
): Promise<T | null> {
  const { data, error } = await supabase
    .from<any, any>(table)
    .update(updates)
    .match(filters)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[v0] update error:", error);
    throw error;
  }
  return data;
}

export async function deleteFrom(
  table: string,
  filters: Record<string, any>,
): Promise<void> {
  const { error } = await supabase.from(table).delete().match(filters);
  if (error) {
    console.error("[v0] deleteFrom error:", error);
    throw error;
  }
}

export async function upsert<T = any>(
  table: string,
  record: Record<string, any>,
  conflictKey: string | string[],
): Promise<T | null> {
  const onConflict = Array.isArray(conflictKey)
    ? conflictKey.join(",")
    : conflictKey;

  const { data, error } = await supabase
    .from<any, any>(table)
    .upsert([record], { onConflict })
    .select()
    .single();

  if (error) {
    console.error("[v0] upsert error:", error);
    throw error;
  }
  return data;
}

export async function count(
  table: string,
  filters: Record<string, any> = {},
): Promise<number> {
  let query: any = supabase.from(table).select("*", {
    count: "exact",
    head: true,
  });
  query = applyFilters(query, filters);

  const { count, error } = await query;
  if (error) {
    console.error("[v0] count error:", error);
    throw error;
  }
  return count ?? 0;
}

export async function hashPassword(
  password: string,
  salt: number,
): Promise<string> {
  const crypto = await import("crypto");
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}
