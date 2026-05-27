export function calculateIncidentMetrics(reports = []) {
  const total = reports.length;
  if (total === 0) {
    return { total: 0, open: 0, closed: 0, highRisk: 0, completionRate: 0 };
  }

  let open = 0;
  let closed = 0;
  let highRisk = 0;

  reports.forEach(r => {
    if (r.status === 'closed') closed++;
    else open++;

    if (r.riskScore >= 10 || r.severity >= 4) {
      highRisk++;
    }
  });

  const completionRate = Math.round((closed / total) * 100);

  return { total, open, closed, highRisk, completionRate };
}
