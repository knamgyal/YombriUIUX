// packages/data/src/supabase/require-auth.ts
import { err, type RepoResult } from "@yombri/domain";
import { isAuthenticated } from "@yombri/supabase-client";

export async function requireAuth<T>(): Promise<RepoResult<T> | null> {
  const ok = await isAuthenticated();
  if (!ok) {
    return err({ code: "UNAUTHENTICATED", message: "User not authenticated" });
  }
  return null;
}
