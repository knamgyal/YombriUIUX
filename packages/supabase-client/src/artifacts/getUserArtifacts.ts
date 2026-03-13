import { getSupabaseClient } from "../client";
import type { Artifact } from "./types";

export async function getUserArtifacts(userId: string): Promise<Artifact[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("legacyartifacts")
    .select("id, userid, eventid, payload, createdat")
    .eq("userid", userId)
    .order("createdat", { ascending: false });

  if (error) throw new Error(`Failed to get user artifacts: ${error.message}`);

  return (data ?? []).map((row: any) => {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    return {
      id: row.id,
      userId: row.userid,
      eventId: row.eventid ?? undefined,
      type: (payload.type === "impact" ? "impact" : "attendance") as Artifact["type"],
      createdAt: row.createdat,
      payload,
    };
  });
}
