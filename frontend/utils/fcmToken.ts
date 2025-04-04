import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const getFcmToken = async () => {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('푸시 알림 권한이 거부되었습니다.');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('📱 Expo Push Token:', token);
  } else {
    console.warn('에뮬레이터에서는 푸시 알림을 지원하지 않습니다.');
  }

  // Android 13 이상 알림 권한 설정 (선택적이지만 권장)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return token;
};
