export function computeTotpCooldown(params: {
  failedAttempts: number;
  lastFailedAtMs: number | null;
  nowMs?: number;
  cooldownMs?: number;
}): { isCooldown: boolean; cooldownUntilMs: number | null } {
  const {
    failedAttempts,
    lastFailedAtMs,
    nowMs = Date.now(),
    cooldownMs = 5 * 60 * 1000,
  } = params;

  if (failedAttempts < 3) return { isCooldown: false, cooldownUntilMs: null };
  if (!lastFailedAtMs) return { isCooldown: false, cooldownUntilMs: null };

  const cooldownUntilMs = lastFailedAtMs + cooldownMs;
  return { isCooldown: nowMs < cooldownUntilMs, cooldownUntilMs };
}

export function isOverInterestSignalsLimit(params: {
  signalsInWindow: number;
  limit?: number;
}): boolean {
  const { signalsInWindow, limit = 10 } = params;
  return signalsInWindow > limit;
}

export function computeEjectionRateRisk(params: {
  ejections: number;
  totalParticipants: number;
  highRiskThreshold?: number;
}): { rate: number; isHighRisk: boolean } {
  const { ejections, totalParticipants, highRiskThreshold = 0.3 } = params;
  const denom = Math.max(1, totalParticipants);
  const rate = ejections / denom;
  return { rate, isHighRisk: rate > highRiskThreshold };
}
