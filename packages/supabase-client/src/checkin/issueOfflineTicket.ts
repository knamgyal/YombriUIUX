import { getCurrentUserId, getSupabaseClient } from "../client";
import type { OfflineTicket } from "../types";

export interface IssueOfflineTicketParams {
  eventId: string;
  ttlHours?: number;
}

export async function issueOfflineTicket(params: IssueOfflineTicketParams): Promise<OfflineTicket> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc("issueofflineticket", {
    pactorid: actorId,
    peventid: params.eventId,
    pttlhours: params.ttlHours ?? null,
  });

  if (error) throw new Error(`Failed to issue offline ticket: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Failed to issue offline ticket: No result returned");

  return data[0] as OfflineTicket;
}
