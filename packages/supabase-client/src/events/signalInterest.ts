import { getCurrentUserId, getSupabaseClient } from "../client";

export interface SignalInterestParams {
  lat: number;
  lng: number;
}

export async function signalInterest(params: SignalInterestParams): Promise<string> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc("signalinterest", {
    pactorid: actorId,
    plat: params.lat,
    plng: params.lng,
  });

  if (error) throw new Error(`Failed to signal interest: ${error.message}`);
  return data as string;
}
