import type { EventSummary, EventsRepo, ParticipantState, RepoResult } from "@yombri/domain";
import { ok, err } from "@yombri/domain";

import { requireAuth } from "./require-auth";
import { supabase } from "./supabase.client";
import { mapSupabaseError } from "./error-map";

// NOTE: Adjust column names here if your schema differs.
type EventsRow = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  address_label: string | null;
  category: EventSummary["category"];
  deleted_at: string | null;
};

function computeDomainStatus(startsAtIso: string): EventSummary["status"] {
  return new Date(startsAtIso) < new Date() ? "past" : "upcoming";
}

function formatWhenLabel(startsAtIso: string, endsAtIso: string | null): string {
  const start = new Date(startsAtIso);
  const end = endsAtIso ? new Date(endsAtIso) : null;

  const date = start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (!end) return `${date} • ${time}`;

  const endTime = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} • ${time}–${endTime}`;
}

function mapRowToEventSummary(r: EventsRow): EventSummary {
  return {
    id: r.id,
    title: r.title,
    whenLabel: formatWhenLabel(r.starts_at, r.ends_at),
    whereLabel: r.address_label ?? "Location",
    category: r.category,
    status: computeDomainStatus(r.starts_at),
  };
}

export function createSupabaseEventsRepo(): EventsRepo {
  return {
    async getEvent(eventId): Promise<RepoResult<EventSummary>> {
      const authErr = await requireAuth<EventSummary>();
      if (authErr) return authErr;

      try {
        const { data, error } = await supabase()
          .from("events")
          .select("id,title,starts_at,ends_at,address_label,category,deleted_at")
          .eq("id", eventId)
          .is("deleted_at", null)
          .maybeSingle();

        if (error) return mapSupabaseError<EventSummary>(error);
        if (!data) return err({ code: "NOT_FOUND", message: "Event not found" });

        return ok(mapRowToEventSummary(data as EventsRow));
      } catch (e) {
        return err({ code: "NETWORK", message: "Network error", details: e });
      }
    },

    async getParticipantState(eventId): Promise<RepoResult<ParticipantState>> {
      const authErr = await requireAuth<ParticipantState>();
      if (authErr) return authErr;

      // If your Phase-2 schema differs, replace this with the correct table/columns.
      // For now, return a deterministic "not joined" rather than crashing your build.
      return ok({ eventId, hasJoined: false, hasCheckedIn: false });
    },

    async joinEvent(_eventId): Promise<RepoResult<void>> {
      const authErr = await requireAuth<void>();
      if (authErr) return authErr;

      return err({ code: "UNKNOWN", message: "joinEvent not wired yet (Phase 2 harness doesn’t require it)" });
    },

    async leaveEvent(_eventId): Promise<RepoResult<void>> {
      const authErr = await requireAuth<void>();
      if (authErr) return authErr;

      return err({ code: "UNKNOWN", message: "leaveEvent not wired yet (Phase 2 harness doesn’t require it)" });
    },
  };
}
