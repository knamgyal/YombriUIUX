import { err, type RepoResult } from "@yombri/domain";

export function mapSupabaseError<T>(e: any): RepoResult<T> {
  const msg = String(e?.message ?? "Unknown error");

  // You will refine this once you see real error codes from RLS + RPCs.
  if (msg.toLowerCase().includes("jwt") || msg.toLowerCase().includes("auth")) {
    return err({ code: "UNAUTHENTICATED", message: msg, details: e });
  }
  if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("rls")) {
    return err({ code: "FORBIDDEN", message: msg, details: e });
  }
  if (msg.toLowerCase().includes("duplicate")) {
    return err({ code: "CONFLICT", message: msg, details: e });
  }

  return err({ code: "UNKNOWN", message: msg, details: e });
}
