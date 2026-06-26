import { exportToCSV, exportToJSON } from '../utils/reportExporter';

describe('Report Exporter Tests', () => {
  test('escapes quotes in titles for CSV export', () => {
    const reports = [
      { id: '1', title: 'Explosion at "Sector 4"', incidentType: 'fire', riskScore: 16 },
    ];
    const csv = exportToCSV(reports);
    expect(csv).toContain('"Explosion at ""Sector 4"""');
  });

  test('serializes array to JSON', () => {
    const json = exportToJSON([{ id: '2' }]);
    expect(json).toContain('"id": "2"');
  });
});
