export type EventStatus = 'scheduled' | 'cancelled' | 'ended';
export type ParticipantStatus = 'joined' | 'checked_in' | 'ejected';
export type CheckinMethod = 'geo' | 'qr' | 'ble' | 'totp' | 'offline_sync';
export type GroupKind = 'event';
export type ClusterBucket = 'single' | 'few' | 'many';
export type AuditEventType =
  | 'event_created'
  | 'event_updated'
  | 'event_cancelled'
  | 'participant_joined'
  | 'participant_checked_in'
  | 'participant_ejected'
  | 'admin_added'
  | 'admin_removed'
  | 'token_minted'
  | 'offline_ticket_issued';

export interface User {
  id: string;
  handle: string | null;
  display_name: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  slug: string;
  title: string;
  sponsor_name: string | null;
  sponsor_url: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  status: EventStatus;
  location: {
    lat: number;
    lng: number;
  };
  address_label: string | null;
  checkin_radius_m: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  checked_in_at: string | null;
  checkin_method: CheckinMethod | null;
  initially_offline: boolean;
  offline_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterestSignal {
  id: string;
  user_id: string;
  location: {
    lat: number;
    lng: number;
  };
  created_at: string;
}

export interface LegacyArtifact {
  id: string;
  user_id: string;
  event_id: string;
  sequence_id: number;
  previous_hash: string | null;
  payload: Record<string, unknown>;
  payload_hash: string;
  created_at: string;
}

export interface Group {
  id: string;
  kind: GroupKind;
  event_id: string | null;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'member' | 'mod' | 'owner';
  created_at: string;
}

export interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface UserBlock {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface EventCluster {
  cell_id: string;
  centroid_lat: number;
  centroid_lng: number;
  bucket: ClusterBucket;
  sample_event_ids: string[];
}

export interface CheckinResult {
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  checked_in_at: string;
  checkin_method: CheckinMethod;
  initially_offline?: boolean;
  offline_synced_at?: string | null;
}

export interface OfflineTicket {
  ticket: string;
  expires_at: string;
}

export interface EventToken {
  token: string;
  issued_at: string;
  expires_at: string;
}

export interface OfflineCheckinPayload {
  event_id: string;
  user_id: string;
  method: CheckinMethod;
  occurred_at: string;
  ticket: string;
}
