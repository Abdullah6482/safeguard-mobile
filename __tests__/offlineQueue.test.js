import { OfflineQueue } from '../lib/offlineQueue';

describe('Offline Queue Manager', () => {
  beforeEach(async () => {
    await OfflineQueue.clear();
  });

  test('persists an item by submission identifier', async () => {
    const report = { clientSubmissionId: 'submission-1', title: 'Broken handrail' };
    const queued = await OfflineQueue.enqueue(report);
    expect(queued.clientSubmissionId).toBe('submission-1');
    expect(await OfflineQueue.count()).toBe(1);
  });

  test('removes item by submission identifier', async () => {
    const item = await OfflineQueue.enqueue({ clientSubmissionId: 'submission-2', title: 'Gas smell' });
    await OfflineQueue.remove(item.clientSubmissionId);
    expect(await OfflineQueue.count()).toBe(0);
  });

  test('quarantines permanent failures without deleting their evidence', async () => {
    await OfflineQueue.enqueue({ clientSubmissionId: 'bad-submission', title: 'Invalid report' });
    await OfflineQueue.recordFailure('bad-submission', new Error('Validation failed'), true);
    expect(await OfflineQueue.getPending()).toHaveLength(0);
    const [failed] = await OfflineQueue.getAll();
    expect(failed._syncState).toBe('failed');
    expect(failed._lastSyncError).toBe('Validation failed');
  });

  test('allows a failed item to be retried explicitly', async () => {
    await OfflineQueue.enqueue({ clientSubmissionId: 'retry-submission' });
    await OfflineQueue.recordFailure('retry-submission', new Error('Bad input'), true);
    await OfflineQueue.retry('retry-submission');
    expect(await OfflineQueue.getPending()).toHaveLength(1);
  });
});
