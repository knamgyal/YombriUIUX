import {
  computeTotpCooldown,
  isOverInterestSignalsLimit,
  computeEjectionRateRisk,
} from '../utils/abuse';

describe('utils/abuse (pure logic)', () => {
  test('No cooldown if failedAttempts < 3', () => {
    const res = computeTotpCooldown({ failedAttempts: 2, lastFailedAtMs: 1 });
    expect(res.isCooldown).toBe(false);
    expect(res.cooldownUntilMs).toBeNull();
  });

  test('No cooldown if lastFailedAtMs missing', () => {
    const res = computeTotpCooldown({ failedAttempts: 3, lastFailedAtMs: null });
    expect(res.isCooldown).toBe(false);
    expect(res.cooldownUntilMs).toBeNull();
  });

  test('Cooldown active until lastFailedAt + 5min', () => {
    const lastFailedAtMs = 1771372800000;
    const nowMs = lastFailedAtMs + 60_000;

    const res = computeTotpCooldown({
      failedAttempts: 3,
      lastFailedAtMs,
      nowMs,
    });

    expect(res.isCooldown).toBe(true);
    expect(res.cooldownUntilMs).toBe(lastFailedAtMs + 5 * 60 * 1000);
  });

  test('Cooldown expires after 5min window', () => {
    const lastFailedAtMs = 1771372800000;
    const nowMs = lastFailedAtMs + 5 * 60 * 1000 + 1;

    const res = computeTotpCooldown({
      failedAttempts: 3,
      lastFailedAtMs,
      nowMs,
    });

    expect(res.isCooldown).toBe(false);
  });

  test('Interest limit default 10', () => {
    expect(isOverInterestSignalsLimit({ signalsInWindow: 10 })).toBe(false);
    expect(isOverInterestSignalsLimit({ signalsInWindow: 11 })).toBe(true);
  });

  test('Interest limit custom', () => {
    expect(isOverInterestSignalsLimit({ signalsInWindow: 2, limit: 2 })).toBe(false);
    expect(isOverInterestSignalsLimit({ signalsInWindow: 3, limit: 2 })).toBe(true);
  });

  test('Ejection rate denominator clamps at 1', () => {
    const res = computeEjectionRateRisk({ ejections: 0, totalParticipants: 0 });
    expect(res.rate).toBe(0);
    expect(res.isHighRisk).toBe(false);
  });

  test('Ejection rate > 30% flags', () => {
    const res = computeEjectionRateRisk({ ejections: 4, totalParticipants: 10 });
    expect(res.rate).toBe(0.4);
    expect(res.isHighRisk).toBe(true);
  });
});
