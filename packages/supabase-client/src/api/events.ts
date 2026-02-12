import { getSupabaseClient, getCurrentUserId } from '../client';
import type { Event, EventCluster } from '../types';

export interface CreateEventParams {
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  lat: number;
  lng: number;
  address_label: string | null;
  checkin_radius_m?: number;
}

export async function createEvent(
  params: CreateEventParams
): Promise<string> {
  const client = getSupabaseClient();
  const actorId = await getCurrentUserId();

  const { data, error } = await client.rpc('create_event', {
    p_actor_id: actorId,
    p_title: params.title,
    p_description: params.description,
    p_starts_at: params.starts_at,
    p_ends_at: params.ends_at,
    p_lat: params.lat,
    p_lng: params.lng,
    p_address_label: params.address_label,
    p_checkin_radius_m: params.checkin_radius_m,
  });

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return data as string;
}

export interface GetEventClustersParams {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  zoom: number;
}

export async function getEventClusters(
  params: GetEventClustersParams
): Promise<EventCluster[]> {
  const client = getSupabaseClient();

  const { data, error } = await client.rpc('events_clusters', {
    p_min_lat: params.minLat,
    p_min_lng: params.minLng,
    p_max_lat: params.maxLat,
    p_max_lng: params.maxLng,
    p_zoom: params.zoom,
  });

  if (error) {
    throw new Error(`Failed to get event clusters: ${error.message}`);
  }

  return (data || []) as EventCluster[];
}

export async function getEvent(eventId: string): Promise<Event | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('id', eventId)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get event: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    location: {
      lat: (data.location as any).coordinates[1],
      lng: (data.location as any).coordinates[0],
    },
  } as Event;
}

export async function getEventsByOrganizer(
  organizerId: string
): Promise<Event[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .is('deleted_at', null)
    .order('starts_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get events by organizer: ${error.message}`);
  }

  return (data || []).map((event) => ({
    ...event,
    location: {
      lat: (event.location as any).coordinates[1],
      lng: (event.location as any).coordinates[0],
    },
  })) as Event[];
}
