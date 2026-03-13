import type { DiscoveryRepo, ListDiscoveryEventsParams } from "@yombri/domain";
import { ok } from "@yombri/domain";
import { EVENTS_SEED } from "./seeds/events.seed";

export function createLocalDiscoveryRepo(): DiscoveryRepo {
  return {
    async listEvents(params: ListDiscoveryEventsParams) {
      const { category, status } = params;
      let out = EVENTS_SEED.slice();

      if (status) out = out.filter((e) => e.status === status);
      if (category !== "all") out = out.filter((e) => e.category === category);

      return ok(out);
    },

    async signalInterest(_input) {
      // Phase 1/2 local: no-op success (or store in memory if you want)
      return ok(undefined);
    },
  };
}
