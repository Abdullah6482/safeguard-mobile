export const RiskLevels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function calculateRiskScore(probability, severity) {
  const prob = parseInt(probability, 10) || 1;
  const sev = parseInt(severity, 10) || 1;
  const score = prob * sev;

  let level = RiskLevels.LOW;
  let color = '#10B981';

  if (score >= 16) {
    level = RiskLevels.CRITICAL;
    color = '#EF4444';
  } else if (score >= 10) {
    level = RiskLevels.HIGH;
    color = '#F97316';
  } else if (score >= 5) {
    level = RiskLevels.MEDIUM;
    color = '#F59E0B';
  }

  return { score, level, color };
}
