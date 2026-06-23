export function exportToCSV(reports = []) {
  const headers = ['ID', 'Title', 'Category', 'Risk Score', 'Status', 'Date'];
  const rows = reports.map(r => [
    r.id || '',
    `"${(r.title || '').replace(/"/g, '""')}"`,
    r.incidentType || '',
    r.riskScore || '',
    r.status || 'open',
    r.createdAt || '',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function exportToJSON(reports = []) {
  return JSON.stringify(reports, null, 2);
}
