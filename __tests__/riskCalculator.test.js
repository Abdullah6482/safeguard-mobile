import { calculateRiskScore, RiskLevels } from '../lib/riskCalculator';

describe('Risk Calculator Engine', () => {
  test('calculates minimum 1x1 as Low risk', () => {
    const { score, level } = calculateRiskScore(1, 1);
    expect(score).toBe(1);
    expect(level).toBe(RiskLevels.LOW);
  });

  test('calculates 3x2 as Medium risk', () => {
    const { score, level } = calculateRiskScore(3, 2);
    expect(score).toBe(6);
    expect(level).toBe(RiskLevels.MEDIUM);
  });

  test('calculates 4x3 as High risk', () => {
    const { score, level } = calculateRiskScore(4, 3);
    expect(score).toBe(12);
    expect(level).toBe(RiskLevels.HIGH);
  });

  test('calculates 5x4 as Critical risk', () => {
    const { score, level } = calculateRiskScore(5, 4);
    expect(score).toBe(20);
    expect(level).toBe(RiskLevels.CRITICAL);
  });
});
