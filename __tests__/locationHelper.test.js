import { formatCoordinates, calculateDistance } from '../utils/locationHelper';

describe('Location Helper Calculations', () => {
  test('formats coordinate pairs to 5 decimal points', () => {
    const formatted = formatCoordinates(24.860734, 67.001136);
    expect(formatted).toBe('24.86073°, 67.00114°');
  });

  test('calculates known distance between coordinates accurately', () => {
    // Approx 111 km per degree latitude
    const distance = calculateDistance(0, 0, 1, 0);
    expect(distance).toBeGreaterThan(110000);
    expect(distance).toBeLessThan(112000);
  });
});
