import { getSupabaseClient } from "../client";

export type EventTotpCode = {
  code: string;
  server_time: string;
  period_seconds: number;
  digits: number;
  window_start: string;
  window_expires: string;
  seconds_left: number;
};

export async function getEventTotpCode(eventId: string): Promise<EventTotpCode> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc("geteventtotpcode", { peventid: eventId });

  if (error) throw new Error(`Failed to get event TOTP code: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Failed to get event TOTP code: No result returned");

  return data[0] as EventTotpCode;
}
