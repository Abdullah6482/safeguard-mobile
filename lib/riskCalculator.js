export const RiskLevels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const LIKELIHOOD_LABELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
export const SEVERITY_LABELS = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

export function calculateRiskScore(probability, severity) {
  const prob = parseInt(probability, 10) || 1;
  const sev = parseInt(severity, 10) || 1;
  const score = prob * sev;

  let level = RiskLevels.LOW;
  let color = '#10B981';

  if (score >= 15) {
    level = RiskLevels.HIGH;
    color = '#EF4444';
  } else if (score >= 5) {
    level = RiskLevels.MEDIUM;
    color = '#F59E0B';
  }

  return { score, level, color };
}
