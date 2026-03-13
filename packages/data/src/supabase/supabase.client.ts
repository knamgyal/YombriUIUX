// packages/data/src/supabase/supabase.client.ts
import { getSupabaseClient } from "@yombri/supabase-client";

export function supabase() {
  return getSupabaseClient();
}
