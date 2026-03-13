import type { EventId, EventSummary, ParticipantState } from "../models/event";
import type { RepoResult } from "../models/repo-errors";

export interface EventsRepo {
  getEvent(eventId: EventId): Promise<RepoResult<EventSummary>>;
  getParticipantState(eventId: EventId): Promise<RepoResult<ParticipantState>>;
  joinEvent(eventId: EventId): Promise<RepoResult<void>>;
  leaveEvent(eventId: EventId): Promise<RepoResult<void>>;
}
