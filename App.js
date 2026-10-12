import RootNavigator from './navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SyncService } from './lib/syncService';

export default function App() {
  useEffect(() => {
    SyncService.syncPending()
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') SyncService.syncPending()
    })
    return () => subscription.remove()
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
