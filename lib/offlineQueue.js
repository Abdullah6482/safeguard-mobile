let memoryQueue = [];

export const OfflineQueue = {
  enqueue(report) {
    const item = {
      ...report,
      _queuedAt: new Date().toISOString(),
      _tempId: 'temp_' + Date.now(),
    };
    memoryQueue.push(item);
    return item;
  },

  getAll() {
    return [...memoryQueue];
  },

  remove(tempId) {
    memoryQueue = memoryQueue.filter(item => item._tempId !== tempId);
  },

  clear() {
    memoryQueue = [];
  },

  count() {
    return memoryQueue.length;
  },
};
