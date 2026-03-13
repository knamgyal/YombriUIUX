import type { EventSummary } from "@yombri/domain";

export const EVENTS_SEED: EventSummary[] = [
  {
    id: "evt_community_cleanup",
    title: "Neighborhood Cleanup",
    whenLabel: "Sat • 10:00 AM–12:00 PM",
    whereLabel: "Fairfax (stub)",
    category: "cleanup",
    status: "upcoming",
  },
  {
    id: "evt_food_pantry",
    title: "Food Pantry Sort",
    whenLabel: "Wed • 6:00 PM–7:30 PM",
    whereLabel: "Fairfax (stub)",
    category: "service",
    status: "upcoming",
  },
  {
    id: "evt_community_talk",
    title: "Community Listening Circle",
    whenLabel: "Last week • 7:00 PM",
    whereLabel: "Fairfax (stub)",
    category: "community",
    status: "past",
  },
];
