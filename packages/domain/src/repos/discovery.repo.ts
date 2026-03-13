import type { EventCategory, EventSummary } from "../models/event";
import type { RepoResult } from "../models/repo-errors";

export type ListDiscoveryEventsParams = {
  category: EventCategory;
  status?: "upcoming" | "past";
};

export type InterestSignalInput = {
  eventId?: string;
};

export interface DiscoveryRepo {
  listEvents(params: ListDiscoveryEventsParams): Promise<RepoResult<EventSummary[]>>;
  signalInterest(input: InterestSignalInput): Promise<RepoResult<void>>;
}
