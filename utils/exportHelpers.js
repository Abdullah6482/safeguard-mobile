export function generateExportFilename(extension = 'csv') {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
  return `safeguard_reports_${dateStr}.${extension}`;
}
