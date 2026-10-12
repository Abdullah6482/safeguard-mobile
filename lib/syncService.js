import { OfflineQueue } from './offlineQueue';
import { isOnline } from './networkMonitor';
import { submitIncident } from './reportService';

export const SyncService = {
  isSyncing: false,

  async syncPending() {
    if (this.isSyncing || !(await isOnline())) return { synced: 0 };
    this.isSyncing = true;

    try {
      const items = await OfflineQueue.getPending();
      let synced = 0;
      let failed = 0;
      for (const item of items) {
        try {
          await submitIncident(item);
          await OfflineQueue.remove(item.clientSubmissionId);
          synced += 1;
        } catch (error) {
          const permanent = error?.retryable === false;
          await OfflineQueue.recordFailure(item.clientSubmissionId, error, permanent);
          if (permanent) {
            failed += 1;
            continue;
          }
          break;
        }
      }
      return { synced, failed };
    } finally {
      this.isSyncing = false;
    }
  },

};
