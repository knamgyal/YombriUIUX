import type { GroupsRepo, GroupId, GroupMessage, GroupSummary } from "@yombri/domain";
import { ok, err } from "@yombri/domain";
import { GROUPS_SEED } from "./seeds/groups.seed";

const localMessagesByGroup = new Map<GroupId, GroupMessage[]>();

export function createLocalGroupsRepo(): GroupsRepo {
  return {
    async listGroupsByEvent(eventId: string) {
      const out = GROUPS_SEED.filter((g) => (g.eventId ?? null) === eventId);
      return ok(out);
    },

    async listMessages(groupId: GroupId, limit = 50) {
      const msgs = localMessagesByGroup.get(groupId) ?? [];
      return ok(msgs.slice(0, limit));
    },

    async sendMessage(groupId: GroupId, body: string) {
      if (!body.trim()) return err({ code: "VALIDATION", message: "Message body is required" });

      const msg: GroupMessage = {
        id: `local_${Date.now()}`,
        groupId,
        authorId: "local_user",
        body,
        createdAt: new Date().toISOString(),
      };

      const existing = localMessagesByGroup.get(groupId) ?? [];
      localMessagesByGroup.set(groupId, [msg, ...existing]);

      return ok(undefined);
    },
  };
}
