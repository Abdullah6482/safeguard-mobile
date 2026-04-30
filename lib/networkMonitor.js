export class NetworkMonitor {
  constructor() {
    this.isOnline = true;
    this.listeners = new Set();
  }

  setOnlineStatus(status) {
    if (this.isOnline !== status) {
      this.isOnline = status;
      this.notifyListeners();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn(this.isOnline));
  }
}

export const networkMonitor = new NetworkMonitor();
