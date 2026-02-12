import { getSupabaseClient, getCurrentUserId } from '../client';

export interface SignalInterestParams {
  lat: number;
  lng: number;
}

export async function signalInterest(
  params: SignalInterestParams
): Promise<string> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('signal_interest', {
    p_actor_id: actorId,
    p_lat: params.lat,
    p_lng: params.lng,
  });

  if (error) {
    throw new Error(`Failed to signal interest: ${error.message}`);
  }

  return data as string;
}
