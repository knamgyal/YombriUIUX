export type GroupId = string;

export type GroupSummary = {
  id: GroupId;
  name: string;
  subtitle?: string;
  eventId?: string; // event-scoped groups
};

export type GroupMessage = {
  id: string;
  groupId: GroupId;
  authorId: string;
  body: string;
  createdAt: string; // ISO
};
