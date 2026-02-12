import { getSupabaseClient, getCurrentUserId } from '../client';
import type { CheckinResult, EventToken, OfflineTicket } from '../types';

export interface VerifyCheckinParams {
  eventId: string;
  lat?: number;
  lng?: number;
  eventToken?: string;
}

export async function verifyCheckin(
  params: VerifyCheckinParams
): Promise<CheckinResult> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('verify_check_in', {
    p_actor_id: actorId,
    p_event_id: params.eventId,
    p_lat: params.lat ?? null,
    p_lng: params.lng ?? null,
    p_event_token: params.eventToken ?? null,
  });

  if (error) {
    throw new Error(`Checkin failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Checkin failed: No result returned');
  }

  return data[0] as CheckinResult;
}

export interface VerifyCheckinTotpParams {
  eventId: string;
  code: number;
  clientTime: string;
}

export async function verifyCheckinTotp(
  params: VerifyCheckinTotpParams
): Promise<CheckinResult> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('verify_check_in_totp', {
    p_actor_id: actorId,
    p_event_id: params.eventId,
    p_code: params.code,
    p_client_time: params.clientTime,
  });

  if (error) {
    throw new Error(`TOTP checkin failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('TOTP checkin failed: No result returned');
  }

  return data[0] as CheckinResult;
}

export interface SyncOfflineCheckinParams {
  eventId: string;
  method: 'geo' | 'totp';
  occurredAt: string;
  ticket: string;
}

export async function syncOfflineCheckin(
  params: SyncOfflineCheckinParams
): Promise<CheckinResult> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('sync_offline_check_in', {
    p_actor_id: actorId,
    p_event_id: params.eventId,
    p_method: params.method,
    p_occurred_at: params.occurredAt,
    p_ticket: params.ticket,
  });

  if (error) {
    throw new Error(`Offline sync failed: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Offline sync failed: No result returned');
  }

  return data[0] as CheckinResult;
}

export interface IssueOfflineTicketParams {
  eventId: string;
  ttlHours?: number;
}

export async function issueOfflineTicket(
  params: IssueOfflineTicketParams
): Promise<OfflineTicket> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('issue_offline_ticket', {
    p_actor_id: actorId,
    p_event_id: params.eventId,
    p_ttl_hours: params.ttlHours ?? null,
  });

  if (error) {
    throw new Error(`Failed to issue offline ticket: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to issue offline ticket: No result returned');
  }

  return data[0] as OfflineTicket;
}

export interface MintEventTokenParams {
  eventId: string;
  ttlSeconds?: number;
}

export async function mintEventToken(
  params: MintEventTokenParams
): Promise<EventToken> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('mint_event_token', {
    p_actor_id: actorId,
    p_event_id: params.eventId,
    p_ttl_seconds: params.ttlSeconds ?? null,
  });

  if (error) {
    throw new Error(`Failed to mint event token: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to mint event token: No result returned');
  }

  return data[0] as EventToken;
}
