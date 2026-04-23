import { validateIncidentReport } from '../utils/formValidator';

describe('Incident Report Form Validator', () => {
  test('flags missing required fields', () => {
    const result = validateIncidentReport({});
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBeDefined();
    expect(result.errors.description).toBeDefined();
  });

  test('validates valid incident report structure', () => {
    const validData = {
      title: 'Oil Spill in Warehouse B',
      description: 'Minor hydraulic leak detected near loading dock 4.',
      incidentType: 'Spill',
      location: 'Warehouse B',
    };
    const result = validateIncidentReport(validData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });
});
