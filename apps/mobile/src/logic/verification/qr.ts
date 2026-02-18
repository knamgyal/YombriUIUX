export interface QrTokenPayload {
  eventId: string;
  issuedAtMs: number;  // epoch ms
  validFromMs: number; // epoch ms
  validToMs: number;   // epoch ms
}

export interface QrValidationOptions {
  nowMs?: number;
  clockSkewMs?: number; // tolerance on both sides
}

export type QrValidationResult =
  | { ok: true }
  | { ok: false; reason: 'expired' | 'not_yet_valid' | 'invalid_range' };

export function validateQrToken(
  payload: QrTokenPayload,
  options: QrValidationOptions = {},
): QrValidationResult {
  const now = options.nowMs ?? Date.now();
  const skew = options.clockSkewMs ?? 30_000; // 30s

  if (payload.validToMs < payload.validFromMs) {
    return { ok: false, reason: 'invalid_range' };
  }

  const earliest = payload.validFromMs - skew;
  const latest = payload.validToMs + skew;

  if (now < earliest) {
    return { ok: false, reason: 'not_yet_valid' };
  }
  if (now > latest) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true };
}
