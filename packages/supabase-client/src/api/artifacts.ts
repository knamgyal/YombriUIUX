import { getSupabaseClient, getCurrentUserId } from '../client';
import type { LegacyArtifact } from '../types';

export interface AppendArtifactParams {
  eventId: string;
  payload: Record<string, unknown>;
}

export async function appendLegacyArtifact(
  params: AppendArtifactParams
): Promise<LegacyArtifact> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('append_legacy_artifact', {
    p_actor_id: actorId,
    p_event_id: params.eventId,
    p_payload: params.payload,
  });

  if (error) {
    throw new Error(`Failed to append artifact: ${error.message}`);
  }

  return data as LegacyArtifact;
}

export async function getUserArtifacts(
  userId: string
): Promise<LegacyArtifact[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('legacy_artifacts')
    .select('*')
    .eq('user_id', userId)
    .order('sequence_id', { ascending: true });

  if (error) {
    throw new Error(`Failed to get user artifacts: ${error.message}`);
  }

  return (data || []) as LegacyArtifact[];
}
