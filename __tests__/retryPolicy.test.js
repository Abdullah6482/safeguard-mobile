import { calculateRetryDelay, isRetryableError, DEFAULT_RETRY_CONFIG } from '../lib/retryPolicy';

describe('retryPolicy', () => {
  test('calculates exponential backoff delay', () => {
    const delay0 = calculateRetryDelay(0, { jitter: 0 });
    const delay1 = calculateRetryDelay(1, { jitter: 0 });
    const delay2 = calculateRetryDelay(2, { jitter: 0 });

    expect(delay0).toBe(1000);
    expect(delay1).toBe(2000);
    expect(delay2).toBe(4000);
  });

  test('respects maxDelay cap', () => {
    const delay = calculateRetryDelay(10, { maxDelayMs: 5000, jitter: 0 });
    expect(delay).toBe(5000);
  });

  test('identifies non-retryable 4xx client errors', () => {
    expect(isRetryableError({ status: 400 })).toBe(false);
    expect(isRetryableError({ status: 401 })).toBe(false);
    expect(isRetryableError({ status: 404 })).toBe(false);
    expect(isRetryableError({ status: 422 })).toBe(false);
  });

  test('identifies retryable 5xx server errors and network drops', () => {
    expect(isRetryableError({ status: 500 })).toBe(true);
    expect(isRetryableError({ status: 503 })).toBe(true);
    expect(isRetryableError(new Error('Network request failed'))).toBe(true);
  });
});
