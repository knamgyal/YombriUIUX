export type Artifact = {
  id: string;
  userId: string;
  eventId?: string;
  type: "impact" | "attendance";
  createdAt: string;
  payload: Record<string, unknown>;
};
