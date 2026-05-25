import { IncidentCategories } from '../constants/incidentCategories';
import { getIncidentColor } from '../utils/incidentTheme';

describe('Incident Taxonomy Tests', () => {
  test('contains required primary HSE categories', () => {
    const ids = IncidentCategories.map(c => c.id);
    expect(ids).toContain('injury');
    expect(ids).toContain('near_miss');
    expect(ids).toContain('spill');
  });

  test('resolves correct color mapping per category', () => {
    expect(getIncidentColor('injury')).toBe('#EF4444');
    expect(getIncidentColor('unknown')).toBe('#0D9488');
  });
});
