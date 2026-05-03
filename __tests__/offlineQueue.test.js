import { OfflineQueue } from '../lib/offlineQueue';

describe('Offline Queue Manager', () => {
  beforeEach(() => {
    OfflineQueue.clear();
  });

  test('enqueues item and assigns temp identifier', () => {
    const report = { title: 'Broken handrail' };
    const queued = OfflineQueue.enqueue(report);
    expect(queued._tempId).toBeDefined();
    expect(OfflineQueue.count()).toBe(1);
  });

  test('removes item by temp ID', () => {
    const item = OfflineQueue.enqueue({ title: 'Gas smell' });
    OfflineQueue.remove(item._tempId);
    expect(OfflineQueue.count()).toBe(0);
  });
});
