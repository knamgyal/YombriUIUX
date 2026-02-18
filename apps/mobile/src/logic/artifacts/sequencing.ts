export interface ArtifactInput {
  eventId: string;
  userId: string;
  payload: unknown;
  previousHash: string | null;
}

export interface ArtifactRecord {
  id: string;
  userId: string;
  eventId: string;
  sequenceId: number;
  previousHash: string | null;
  hash: string;
}

export class ArtifactSequencer {
  private records: ArtifactRecord[] = [];

  constructor(private hashFn: (input: string) => string) {}

  append(input: ArtifactInput): ArtifactRecord {
    const userRecords = this.records.filter(r => r.userId === input.userId);
    const last = userRecords[userRecords.length - 1];

    if (last && last.hash !== input.previousHash) {
      throw new Error('Invalid previous hash');
    }

    const sequenceId = (last?.sequenceId ?? 0) + 1;
    const base = JSON.stringify({
      userId: input.userId,
      eventId: input.eventId,
      sequenceId,
      previousHash: input.previousHash,
      payload: input.payload,
    });

    const hash = this.hashFn(base);
    const id = this.hashFn(hash + ':id');

    const record: ArtifactRecord = {
      id,
      userId: input.userId,
      eventId: input.eventId,
      sequenceId,
      previousHash: input.previousHash,
      hash,
    };

    this.records = [...this.records, record]; // immutable append
    return record;
  }

  listForUser(userId: string): readonly ArtifactRecord[] {
    return this.records.filter(r => r.userId === userId).sort((a, b) => a.sequenceId - b.sequenceId);
  }
}
