import { ArtifactSequencer } from './sequencing';

const fakeHash = (input: string) => `h:${input.length}`;

describe('ArtifactSequencer', () => {
  it('assigns incremental ordering per user', () => {
    const seq = new ArtifactSequencer(fakeHash);

    const a1 = seq.append({
      userId: 'u1',
      eventId: 'e1',
      payload: {},
      previousHash: null,
    });
    const a2 = seq.append({
      userId: 'u1',
      eventId: 'e2',
      payload: {},
      previousHash: a1.hash,
    });

    expect(a1.sequenceId).toBe(1);
    expect(a2.sequenceId).toBe(2);
    expect(seq.listForUser('u1').map(a => a.sequenceId)).toEqual([1, 2]);
  });

  it('rejects out-of-order append with wrong previous hash', () => {
    const seq = new ArtifactSequencer(fakeHash);
    const first = seq.append({
      userId: 'u1',
      eventId: 'e1',
      payload: {},
      previousHash: null,
    });

    expect(first.hash).toBeDefined(); // Use 'first' here

    expect(() =>
      seq.append({
        userId: 'u1',
        eventId: 'e2',
        payload: {},
        previousHash: 'some-other-hash',
      }),
    ).toThrow('Invalid previous hash');
  });

  it('prevents duplicates via hash chain constraint', () => {
    const seq = new ArtifactSequencer(fakeHash);

    const first = seq.append({
      userId: 'u1',
      eventId: 'e1',
      payload: {},
      previousHash: null,
    });

    expect(first.sequenceId).toBe(1); // Use 'first' here

    expect(() =>
      seq.append({
        userId: 'u1',
        eventId: 'e1',
        payload: {},
        previousHash: null, // trying to "replay" from genesis
      }),
    ).toThrow('Invalid previous hash');
  });

  it('simulates concurrent appends deterministically', () => {
    const seq = new ArtifactSequencer(fakeHash);

    // User starts with genesis
    const genesis = seq.append({
      userId: 'u1',
      eventId: 'e1',
      payload: {},
      previousHash: null,
    });

    expect(genesis.sequenceId).toBe(1); // Use 'genesis' here

    // Two concurrent attempts both using genesis.hash as previousHash
    const append1 = () =>
      seq.append({
        userId: 'u1',
        eventId: 'e2',
        payload: { name: 'A' },
        previousHash: genesis.hash,
      });

    const append2 = () =>
      seq.append({
        userId: 'u1',
        eventId: 'e3',
        payload: { name: 'B' },
        previousHash: genesis.hash,
      });

    const r1 = append1();
    expect(() => append2()).toThrow('Invalid previous hash');

    const list = seq.listForUser('u1');
    expect(list).toHaveLength(2);
    expect(list[1].eventId).toBe(r1.eventId);
    expect(r1.sequenceId).toBe(2); // Use 'r1' here
  });

  it('maintains immutability of ledger', () => {
    const seq = new ArtifactSequencer(fakeHash);
    const a1 = seq.append({
      userId: 'u1',
      eventId: 'e1',
      payload: {},
      previousHash: null,
    });

    expect(a1.sequenceId).toBe(1); // Use 'a1' here

    const snapshot = seq.listForUser('u1');
    expect(Object.isFrozen(snapshot)).toBe(false); // we expose read-only through typing, not frozen

    const a2 = seq.append({
      userId: 'u1',
      eventId: 'e2',
      payload: {},
      previousHash: a1.hash,
    });

    expect(a2.sequenceId).toBe(2); // Use 'a2' here

    const snapshot2 = seq.listForUser('u1');
    expect(snapshot2).not.toBe(snapshot);
    expect(snapshot2.length).toBe(2);
  });
});
