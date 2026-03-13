import { getCurrentUserId, getSupabaseClient } from "../client";
import type { CheckinResult } from "../types";

export interface VerifyCheckinParams {
  eventId: string;
  lat?: number;
  lng?: number;
  eventToken?: string;
}

export async function verifyCheckin(params: VerifyCheckinParams): Promise<CheckinResult> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc("verifycheckin", {
    pactorid: actorId,
    peventid: params.eventId,
    plat: params.lat ?? null,
    plng: params.lng ?? null,
    peventtoken: params.eventToken ?? null,
  });

  if (error) throw new Error(`Checkin failed: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Checkin failed: No result returned");

  return data[0] as CheckinResult;
}
