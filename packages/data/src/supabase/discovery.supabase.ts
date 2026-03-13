// packages/data/src/supabase/discovery.supabase.ts
import type { DiscoveryRepo, EventSummary, ListDiscoveryEventsParams, RepoResult } from "@yombri/domain";
import { ok, err } from "@yombri/domain";

import { requireAuth } from "./require-auth";
import { supabase } from "./supabase.client";
import { mapSupabaseError } from "./error-map";

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
  const now = new Date();
  const isPast = new Date(startsAtIso) < now;
  return isPast ? "past" : "upcoming";
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

export function createSupabaseDiscoveryRepo(): DiscoveryRepo {
  return {
    async listEvents(params: ListDiscoveryEventsParams): Promise<RepoResult<EventSummary[]>> {
      const authErr = await requireAuth<EventSummary[]>();
      if (authErr) return authErr;

      try {
        let q = supabase()
          .from("events")
          .select("id,title,starts_at,ends_at,address_label,category,deleted_at")
          .is("deleted_at", null)
          .order("starts_at", { ascending: true })
          .limit(200);

        if (params.category !== "all") q = q.eq("category", params.category);

        const { data, error } = await q;
        if (error) return mapSupabaseError<EventSummary[]>(error);

        const rows = (data ?? []) as EventsRow[];
        let mapped = rows.map(mapRowToEventSummary);

        if (params.status) {
          mapped = mapped.filter((e) => e.status === params.status);
        }

        return ok(mapped);
      } catch (e) {
        return err({ code: "NETWORK", message: "Network error", details: e });
      }
    },

    async signalInterest(input): Promise<RepoResult<void>> {
      const authErr = await requireAuth<void>();
      if (authErr) return authErr;

      try {
        const { error } = await supabase().rpc("signal_interest", input);
        if (error) return mapSupabaseError<void>(error);
        return ok(undefined);
      } catch (e) {
        return err({ code: "NETWORK", message: "Network error", details: e });
      }
    },
  };
}
