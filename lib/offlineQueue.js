import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'

const STORAGE_KEY = '@safeguard/pending-reports/v1'

async function readQueue() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

async function writeQueue(items) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

async function persistEvidence(report) {
  const uri = report.details?.photoUri
  if (!uri || uri.startsWith(FileSystem.documentDirectory)) return report
  const directory = `${FileSystem.documentDirectory}safeguard-pending/`
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
  const extension = uri.split('.').pop()?.split(/[?#]/)[0] || 'jpg'
  const destination = `${directory}${report.clientSubmissionId}.${extension}`
  await FileSystem.copyAsync({ from: uri, to: destination })
  return { ...report, details: { ...report.details, photoUri: destination } }
}

export const OfflineQueue = {
  async enqueue(report) {
    const items = await readQueue()
    const existing = items.find(item => item.clientSubmissionId === report.clientSubmissionId)
    if (existing) return existing
    const durableReport = await persistEvidence(report)
    const item = { ...durableReport, _queuedAt: new Date().toISOString() }
    await writeQueue([...items, item])
    return item
  },

  getAll: readQueue,

  async getPending() {
    return (await readQueue()).filter(item => item._syncState !== 'failed')
  },

  async recordFailure(clientSubmissionId, error, permanent = false) {
    const items = await readQueue()
    const next = items.map(item => item.clientSubmissionId === clientSubmissionId ? {
      ...item,
      _syncState: permanent ? 'failed' : 'pending',
      _syncAttempts: (item._syncAttempts || 0) + 1,
      _lastSyncError: error?.message || String(error || 'Unknown synchronization error'),
      _lastSyncAttemptAt: new Date().toISOString(),
    } : item)
    await writeQueue(next)
  },

  async retry(clientSubmissionId) {
    const items = await readQueue()
    await writeQueue(items.map(item => item.clientSubmissionId === clientSubmissionId
      ? { ...item, _syncState: 'pending', _lastSyncError: null }
      : item))
  },

  async remove(clientSubmissionId) {
    const items = await readQueue()
    const removed = items.find(item => item.clientSubmissionId === clientSubmissionId)
    const uri = removed?.details?.photoUri
    if (uri?.startsWith(FileSystem.documentDirectory)) {
      await FileSystem.deleteAsync(uri, { idempotent: true })
    }
    await writeQueue(items.filter(item => item.clientSubmissionId !== clientSubmissionId))
  },

  async clear() {
    const items = await readQueue()
    await Promise.all(items.map(item => {
      const uri = item.details?.photoUri
      return uri?.startsWith(FileSystem.documentDirectory)
        ? FileSystem.deleteAsync(uri, { idempotent: true })
        : Promise.resolve()
    }))
    await writeQueue([])
  },

  async count() { return (await readQueue()).length },
};
