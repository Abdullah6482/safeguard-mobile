import { calculatePillarComposite } from '../lib/pillarScorer';

describe('Pillar Scorer Unit Tests', () => {
  test('picks highest value as maxScore', () => {
    const res = calculatePillarComposite({ people: 4, asset: 2, environment: 1, reputation: 3 });
    expect(res.maxScore).toBe(4);
  });

  test('calculates correct average', () => {
    const res = calculatePillarComposite({ people: 2, asset: 2, environment: 2, reputation: 2 });
    expect(res.average).toBe(2);
  });
});
