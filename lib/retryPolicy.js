export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 15000,
  factor: 2,
  jitter: 0.1,
};

export function calculateRetryDelay(attempt, config = DEFAULT_RETRY_CONFIG) {
  const merged = { ...DEFAULT_RETRY_CONFIG, ...config };
  const rawDelay = merged.initialDelayMs * Math.pow(merged.factor, attempt);
  const cappedDelay = Math.min(rawDelay, merged.maxDelayMs);
  const jitterRange = cappedDelay * merged.jitter;
  const jitterOffset = (Math.random() * 2 - 1) * jitterRange;
  return Math.max(0, Math.round(cappedDelay + jitterOffset));
}

export function isRetryableError(error) {
  if (!error) return false;
  const status = error.status || error.statusCode;
  if (status && (status === 400 || status === 401 || status === 403 || status === 404 || status === 422)) {
    return false;
  }
  return true;
}
