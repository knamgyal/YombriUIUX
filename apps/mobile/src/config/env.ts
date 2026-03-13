// apps/mobile/src/config/env.ts
export type DataSource = "local" | "supabase";

function read(name: string): string | undefined {
  return process.env[name];
}

function required(name: string): string {
  const v = read(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function parseDataSource(v: string | undefined): DataSource {
  return v === "supabase" ? "supabase" : "local";
}

export const ENV = (() => {
  const DATA_SOURCE = parseDataSource(read("EXPO_PUBLIC_DATA_SOURCE"));

  if (DATA_SOURCE === "supabase") {
    const SUPABASE_URL = required("EXPO_PUBLIC_SUPABASE_URL");
    const SUPABASE_ANON_KEY = required("EXPO_PUBLIC_SUPABASE_ANON_KEY");

    if (!SUPABASE_URL.startsWith("https://")) {
      throw new Error("EXPO_PUBLIC_SUPABASE_URL must start with https://");
    }

    return { DATA_SOURCE, SUPABASE_URL, SUPABASE_ANON_KEY } as const;
  }

  return { DATA_SOURCE } as const;
})();
