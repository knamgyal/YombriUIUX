import { getSupabaseClient } from "../client";
import type { Event } from "../types";

export async function getEventDetail(eventId: string): Promise<Event | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("id", eventId)
    .is("deletedat", null)
    .single();

  if (error) {
    // PGRST116 = No rows
    if ((error as any).code === "PGRST116") return null;
    throw new Error(`Failed to get event: ${error.message}`);
  }

  if (!data) return null;

  return {
    ...(data as any),
    location: {
      lat: (data.location as any)?.coordinates?.[1],
      lng: (data.location as any)?.coordinates?.[0],
    },
  } as Event;
}
