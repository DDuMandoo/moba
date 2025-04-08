// utils/permissions.ts
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const PERMISSIONS_KEY = 'userPermissions';

export interface PermissionState {
  notification: boolean;
  location: boolean;
  gallery: boolean;
}

export async function requestPermissionsIfNeeded(): Promise<PermissionState> {
  const { status: notiStatus } = await Notifications.requestPermissionsAsync();
  const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
  const { status: galleryStatus } = await MediaLibrary.requestPermissionsAsync();

  const result: PermissionState = {
    notification: notiStatus === 'granted',
    location: locStatus === 'granted',
    gallery: galleryStatus === 'granted',
  };

  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(result));
  return result;
}

export async function loadPermissions(): Promise<PermissionState> {
  const stored = await AsyncStorage.getItem(PERMISSIONS_KEY);
  return stored
    ? JSON.parse(stored)
    : { notification: false, location: false, gallery: false };
}

export async function savePermissions(data: PermissionState) {
  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(data));
}
