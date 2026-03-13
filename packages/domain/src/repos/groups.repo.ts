// packages/domain/src/repos/groups.repo.ts
import type { GroupId, GroupMessage, GroupSummary } from "../models/group";
import type { RepoResult } from "../models/repo-errors";

export interface GroupsRepo {
  listGroupsByEvent(eventId: string): Promise<RepoResult<GroupSummary[]>>;
  listMessages(groupId: GroupId, limit?: number): Promise<RepoResult<GroupMessage[]>>;
  sendMessage(groupId: GroupId, body: string): Promise<RepoResult<void>>;
}
