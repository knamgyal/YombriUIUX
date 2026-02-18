export interface ThresholdConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface AttemptRecord {
  timestampMs: number;
}

export interface ThresholdState {
  attempts: AttemptRecord[];
}

export interface ThresholdResult {
  allow: boolean;
  remaining: number;
}

export function evaluateThreshold(
  state: ThresholdState,
  config: ThresholdConfig,
  nowMs: number,
): ThresholdResult {
  const windowStart = nowMs - config.windowMs;
  const recent = state.attempts.filter(a => a.timestampMs >= windowStart);
  const count = recent.length;

  if (count >= config.maxAttempts) {
    return { allow: false, remaining: 0 };
  }

  return {
    allow: true,
    remaining: config.maxAttempts - count,
  };
}
