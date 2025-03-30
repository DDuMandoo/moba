// utils/permissions.ts
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PERMISSIONS_KEY = 'userPermissions';

export async function requestPermissionsIfNeeded() {
  const { status: notiStatus } = await Notifications.requestPermissionsAsync();
  const { status: locStatus } = await Location.requestForegroundPermissionsAsync();

  const result = {
    notification: notiStatus === 'granted',
    location: locStatus === 'granted'
  };

  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(result));
  return result;
}

export async function loadPermissions() {
  const stored = await AsyncStorage.getItem(PERMISSIONS_KEY);
  return stored ? JSON.parse(stored) : { notification: false, location: false };
}

export async function savePermissions(data: { notification: boolean; location: boolean }) {
  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(data));
}
