import { validateQrToken, QrTokenPayload } from './qr';

const base: QrTokenPayload = {
  eventId: 'evt_1',
  issuedAtMs: Date.UTC(2026, 0, 1, 0, 0, 0),   // Jan 1 2026 00:00:00 UTC
  validFromMs: Date.UTC(2026, 0, 1, 0, 0, 0),
  validToMs: Date.UTC(2026, 0, 1, 0, 5, 0),    // +5 min
};

describe('validateQrToken', () => {
  it('rejects expired QR', () => {
    const now = base.validToMs + 60_000; // 1 min after expiry
    const result = validateQrToken(base, { nowMs: now, clockSkewMs: 0 });
    expect(result).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects not-yet-valid QR', () => {
    const now = base.validFromMs - 60_000; // 1 min before start
    const result = validateQrToken(base, { nowMs: now, clockSkewMs: 0 });
    expect(result).toEqual({ ok: false, reason: 'not_yet_valid' });
  });

  it('accepts valid QR in window', () => {
    const now = base.validFromMs + 60_000; // 1 min into window
    const result = validateQrToken(base, { nowMs: now });
    expect(result.ok).toBe(true);
  });

  it('treats boundary timestamp as valid with skew', () => {
    const skew = 30_000;
    const nowJustBefore = base.validFromMs - skew;
    const nowJustAfter = base.validToMs + skew;

    expect(validateQrToken(base, { nowMs: nowJustBefore, clockSkewMs: skew }).ok).toBe(true);
    expect(validateQrToken(base, { nowMs: nowJustAfter, clockSkewMs: skew }).ok).toBe(true);
  });

  it('is timezone-agnostic (uses epoch ms)', () => {
    // same UTC milliseconds regardless of local timezone
    const localNow = base.validFromMs + 1_000;
    const result = validateQrToken(base, { nowMs: localNow });
    expect(result.ok).toBe(true);
  });

  it('rejects invalid ranges', () => {
    const invalid: QrTokenPayload = {
      ...base,
      validFromMs: base.validToMs + 1_000,
    };
    const result = validateQrToken(invalid);
    expect(result).toEqual({ ok: false, reason: 'invalid_range' });
  });
});
