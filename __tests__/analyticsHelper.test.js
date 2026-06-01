import { calculateIncidentMetrics } from '../utils/analyticsHelper';

describe('Analytics Helper', () => {
  test('handles empty report list', () => {
    const res = calculateIncidentMetrics([]);
    expect(res.total).toBe(0);
    expect(res.completionRate).toBe(0);
  });

  test('computes metrics accurately across mixed statuses', () => {
    const reports = [
      { status: 'open', riskScore: 5 },
      { status: 'closed', riskScore: 12 },
      { status: 'open', riskScore: 16 },
    ];
    const res = calculateIncidentMetrics(reports);
    expect(res.total).toBe(3);
    expect(res.open).toBe(2);
    expect(res.closed).toBe(1);
    expect(res.highRisk).toBe(2);
    expect(res.completionRate).toBe(33);
  });
});
