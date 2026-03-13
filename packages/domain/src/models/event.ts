export type EventCategory =
  | "all"
  | "general"
  | "service"
  | "community"
  | "cleanup"
  | "education";

export type EventSummary = {
  id: EventId;
  title: string;
  whenLabel: string;
  whereLabel: string;
  category: Exclude<EventCategory, "all">;
  status: EventStatus;
};
