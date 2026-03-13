import { getSupabaseClient } from "../client";
import type { Event } from "../types";

export interface ListEventsParams {
  organizerId?: string;
  limit?: number;
}

export async function listEvents(params: ListEventsParams = {}): Promise<Event[]> {
  const client = getSupabaseClient();

  let q = client
    .from("events")
    .select("*")
    .is("deletedat", null)
    .order("startsat", { ascending: true })
    .limit(params.limit ?? 50);

  if (params.organizerId) q = q.eq("organizerid", params.organizerId);

  const { data, error } = await q;
  if (error) throw new Error(`Failed to list events: ${error.message}`);

  return (data ?? []).map((e: any) => ({
    ...e,
    location: {
      lat: (e.location as any)?.coordinates?.[1],
      lng: (e.location as any)?.coordinates?.[0],
    },
  })) as Event[];
}
