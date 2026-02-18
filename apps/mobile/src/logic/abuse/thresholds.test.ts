import { evaluateThreshold, ThresholdState } from './thresholds';

const config = { maxAttempts: 3, windowMs: 5 * 60_000 }; // 5 minutes

describe('evaluateThreshold', () => {
  it('allows when threshold not reached', () => {
    const now = Date.now();
    const state: ThresholdState = {
      attempts: [{ timestampMs: now - 60_000 }], // 1 min ago
    };
    const result = evaluateThreshold(state, config, now);
    expect(result.allow).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('blocks when threshold reached', () => {
    const now = Date.now();
    const state: ThresholdState = {
      attempts: [
        { timestampMs: now - 60_000 },
        { timestampMs: now - 30_000 },
        { timestampMs: now - 10_000 },
      ],
    };
    const result = evaluateThreshold(state, config, now);
    expect(result.allow).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('blocks when over threshold', () => {
    const now = Date.now();
    const state: ThresholdState = {
      attempts: [
        { timestampMs: now - 60_000 },
        { timestampMs: now - 30_000 },
        { timestampMs: now - 10_000 },
        { timestampMs: now - 5_000 },
      ],
    };
    const result = evaluateThreshold(state, config, now);
    expect(result.allow).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after window expires', () => {
    const now = Date.now();
    const old = now - config.windowMs - 1_000; // just outside window
    const state: ThresholdState = {
      attempts: [
        { timestampMs: old },
        { timestampMs: old },
        { timestampMs: old },
      ],
    };
    const result = evaluateThreshold(state, config, now);
    expect(result.allow).toBe(true);
    expect(result.remaining).toBe(config.maxAttempts);
  });

  it('handles boundary exactly at window start', () => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const state: ThresholdState = {
      attempts: [{ timestampMs: windowStart }],
    };
    const result = evaluateThreshold(state, config, now);
    expect(result.allow).toBe(true);
    expect(result.remaining).toBe(2);
  });
});
