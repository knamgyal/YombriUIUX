import type { EventsRepo, EventId, ParticipantState } from "@yombri/domain";
import { ok, err } from "@yombri/domain";
import { EVENTS_SEED } from "./seeds/events.seed";

const localParticipation = new Map<EventId, ParticipantState>();

export function createLocalEventsRepo(): EventsRepo {
  return {
    async getEvent(eventId) {
      const found = EVENTS_SEED.find((e) => e.id === eventId);
      if (!found) return err({ code: "NOT_FOUND", message: "Event not found" });
      return ok(found);
    },

    async getParticipantState(eventId) {
      return ok(localParticipation.get(eventId) ?? { eventId, hasJoined: false, hasCheckedIn: false });
    },

    async joinEvent(eventId) {
      localParticipation.set(eventId, { eventId, hasJoined: true, hasCheckedIn: false });
      return ok(undefined);
    },

    async leaveEvent(eventId) {
      localParticipation.set(eventId, { eventId, hasJoined: false, hasCheckedIn: false });
      return ok(undefined);
    },
  };
}
