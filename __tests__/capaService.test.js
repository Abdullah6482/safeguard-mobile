import { createCapaItem, calculateCapaProgress } from '../lib/capaService';

describe('CAPA Service', () => {
  test('creates new CAPA action with default pending status', () => {
    const item = createCapaItem({ title: 'Replace hose', assignedTo: 'John Doe' });
    expect(item.status).toBe('pending');
    expect(item.id).toBeDefined();
  });

  test('calculates percentage accurately', () => {
    const actions = [
      { status: 'completed' },
      { status: 'pending' },
    ];
    expect(calculateCapaProgress(actions)).toBe(50);
  });
});
