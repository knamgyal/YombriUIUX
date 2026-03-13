import { getCurrentUserId, getSupabaseClient } from "../client";
import type { Artifact } from "./types";

export interface AppendLegacyArtifactParams {
  eventId: string;
  payload: Record<string, unknown>;
}

export async function appendLegacyArtifact(params: AppendLegacyArtifactParams): Promise<Artifact> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc("appendlegacyartifact", {
    pactorid: actorId,
    peventid: params.eventId,
    ppayload: params.payload,
  });

  if (error) throw new Error(`Failed to append artifact: ${error.message}`);

  const row = data as any;
  const payload = (row?.payload ?? {}) as Record<string, unknown>;

  return {
    id: row.id,
    userId: row.userid ?? row.userId ?? actorId,
    eventId: row.eventid ?? row.eventId ?? params.eventId,
    type: (payload.type === "impact" ? "impact" : "attendance") as Artifact["type"],
    createdAt: row.createdat ?? row.createdAt ?? new Date().toISOString(),
    payload,
  };
}
