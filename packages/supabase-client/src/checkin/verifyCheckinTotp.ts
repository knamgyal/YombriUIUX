import { getCurrentUserId, getSupabaseClient } from "../client";
import type { CheckinResult } from "../types";

export interface VerifyCheckinTotpParams {
  eventId: string;
  code: number;
  clientTime: string; // ISO
}

export async function verifyCheckinTotp(params: VerifyCheckinTotpParams): Promise<CheckinResult> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc("verifycheckintotp", {
    pactorid: actorId,
    peventid: params.eventId,
    pcode: params.code,
    pclienttime: params.clientTime,
  });

  if (error) throw new Error(`TOTP checkin failed: ${error.message}`);
  if (!data || data.length === 0) throw new Error("TOTP checkin failed: No result returned");

  return data[0] as CheckinResult;
}
