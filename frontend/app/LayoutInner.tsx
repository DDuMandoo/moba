// 📂app/LayoutInner.tsx
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/redux/store';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { requestPermissionsIfNeeded } from '@/utils/permissions';
import { setPermissions } from '@/redux/slices/permissionSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import axiosInstance from './axiosInstance';
import CustomAlert from '@/components/CustomAlert';

interface Props {
  children?: ReactNode;
}

function InitPermissions() {
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      const result = await requestPermissionsIfNeeded();
      dispatch(setPermissions(result)); 
    };    
    init();
  }, []);

  return null;
}

export default function LayoutInner({ children }: Props) {
  const router = useRouter();
  const { profile } = useAppSelector((state) => state.user);
  const alertRef = useRef<{ show: (msg: string) => void }>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
  };

  useEffect(() => {
    const sub = Linking.addEventListener('url', async ({ url }) => {
      const { path } = Linking.parse(url);
      if (path?.startsWith('appointment/')) {
        const id = path.split('/')[1];

        if (profile) {
          try {
            await axiosInstance.post('/appointments/join', {
              memberId: profile.memberId,
            });
          } catch (err: any) {
            const msg = err?.response?.data?.message || '이미 참여 중이거나 오류입니다.';
            showAlert(msg);
          }

          router.push(`/promises/${id}`);
        } else {
          router.replace({ pathname: '/auth/login', params: { redirect: `/promises/${id}` } });
        }
      }
    });

    return () => sub.remove();
  }, [profile]);

  const [fontsLoaded] = useFonts({
    'NanumSquareRound-Regular': require('@/assets/fonts/NanumSquareRoundR.ttf'),
    'NanumSquareRound-Bold': require('@/assets/fonts/NanumSquareRoundB.ttf'),
    'NanumSquareRound-ExtraBold': require('@/assets/fonts/NanumSquareRoundEB.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <InitPermissions />
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {children ?? <Slot />}
      </View>
      
      <CustomAlert
        visible={!!alertMsg}
        title="알림"
        message={alertMsg || ''}
        onClose={() => setAlertMsg(null)}
      />
    </GestureHandlerRootView>
  );
}
