export function calculatePillarComposite(scores = {}) {
  const people = scores.people || 0;
  const asset = scores.asset || 0;
  const environment = scores.environment || 0;
  const reputation = scores.reputation || 0;

  // Maximum single pillar score determines overall severity
  const maxScore = Math.max(people, asset, environment, reputation);
  const average = Math.round((people + asset + environment + reputation) / 4);

  return { maxScore, average };
}
