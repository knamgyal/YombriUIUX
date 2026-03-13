import { getCurrentUserId, getSupabaseClient } from "../client";
import type { EventToken } from "../types";

export interface MintEventTokenParams {
  eventId: string;
  ttlSeconds?: number;
}

type TokenRow =
  | {
      token: string;
      issued_at?: string;
      expires_at?: string;
      issuedAt?: string;
      expiresAt?: string;
      issuedat?: string;
      expiresat?: string;
    }
  | string;

function normalizeEventToken(data: TokenRow): EventToken {
  if (typeof data === "string") {
    return {
      token: data,
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }

  return {
    token: data.token,
    issued_at:
      data.issued_at ??
      data.issuedAt ??
      data.issuedat ??
      new Date().toISOString(),
    expires_at:
      data.expires_at ??
      data.expiresAt ??
      data.expiresat ??
      new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}

export async function mintEventToken(params: MintEventTokenParams): Promise<EventToken> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc("minteventtoken", {
    pactorid: actorId,
    peventid: params.eventId,
    pttlseconds: params.ttlSeconds ?? null,
  });

  if (error) throw new Error(`Failed to mint event token: ${error.message}`);
  if (!data) throw new Error("Failed to mint event token: No result returned");

  if (Array.isArray(data)) {
    if (data.length === 0) throw new Error("Failed to mint event token: No rows returned");
    return normalizeEventToken(data[0] as TokenRow);
  }

  return normalizeEventToken(data as TokenRow);
}
