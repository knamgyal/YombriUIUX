// packages/data/src/supabase/groups.supabase.ts
import type { GroupsRepo, GroupMessage, GroupSummary } from "@yombri/domain";
import { ok, err } from "@yombri/domain";
import { requireAuth } from "./require-auth";
import { supabase } from "./supabase.client";
import { mapSupabaseError } from "./error-map";

export function createSupabaseGroupsRepo(): GroupsRepo {
  return {
    async listGroupsByEvent(eventId) {
      const authErr = await requireAuth<GroupSummary[]>();
      if (authErr) return authErr;

      const { data, error } = await supabase()
        .from("event_groups")
        .select("id,name,subtitle,event_id")
        .eq("event_id", eventId);

      if (error) return mapSupabaseError(error);

      return ok(
        (data ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          subtitle: r.subtitle ?? undefined,
          eventId: r.event_id ?? undefined,
        }))
      );
    },

    async listMessages(groupId, limit = 50) {
      const authErr = await requireAuth<GroupMessage[]>();
      if (authErr) return authErr;

      const { data, error } = await supabase()
        .from("messages")
        .select("id,group_id,author_id,body,created_at")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) return mapSupabaseError(error);

      return ok(
        (data ?? []).map((r: any) => ({
          id: r.id,
          groupId: r.group_id,
          authorId: r.author_id,
          body: r.body,
          createdAt: r.created_at,
        }))
      );
    },

    async sendMessage(groupId, body) {
      const authErr = await requireAuth<void>();
      if (authErr) return authErr;

      if (!body.trim()) {
        return err({ code: "VALIDATION", message: "Message body is required" });
      }

      const { error } = await supabase().from("messages").insert({
        group_id: groupId,
        body,
      });

      if (error) return mapSupabaseError(error);
      return ok(undefined);
    },
  };
}
