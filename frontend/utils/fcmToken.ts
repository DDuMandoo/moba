import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export const getFcmToken = async () => {
  // 알림 권한 요청
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.warn('알림 권한이 없습니다.');
    return null;
  }

  // FCM 토큰 가져오기
  const token = await messaging().getToken();

  // Android의 경우 foreground 메시지 처리
  if (Platform.OS === 'android') {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
    });
  }

  return token;
};