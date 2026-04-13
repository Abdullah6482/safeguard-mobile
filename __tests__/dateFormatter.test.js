import { formatDate, timeAgo } from '../utils/dateFormatter';

describe('dateFormatter utility tests', () => {
  test('formats empty or null inputs gracefully', () => {
    expect(formatDate(null)).toBe('');
    expect(timeAgo(null)).toBe('');
  });

  test('formats standard ISO date string', () => {
    const formatted = formatDate('2026-04-01T12:00:00Z');
    expect(formatted).toContain('2026');
  });

  test('calculates recent time as just now', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('just now');
  });
});
