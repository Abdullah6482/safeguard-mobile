import * as Network from 'expo-network'

export async function isOnline() {
  const state = await Network.getNetworkStateAsync()
  return state.isConnected === true && state.isInternetReachable !== false
}
