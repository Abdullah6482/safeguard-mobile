import { OfflineQueue } from './offlineQueue';
import { networkMonitor } from './networkMonitor';

export const SyncService = {
  isSyncing: false,

  async syncPending(submitFn) {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const items = OfflineQueue.getAll();
      for (const item of items) {
        if (submitFn) {
          await submitFn(item);
        }
        OfflineQueue.remove(item._tempId);
      }
    } finally {
      this.isSyncing = false;
    }
  },

  initAutoSync(submitFn) {
    networkMonitor.subscribe(isOnline => {
      if (isOnline) {
        this.syncPending(submitFn);
      }
    });
  },
};
