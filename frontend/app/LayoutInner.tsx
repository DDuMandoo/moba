// 📂app/LayoutInner.tsx
import React, { ReactNode, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/redux/store';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { requestPermissionsIfNeeded } from '@/utils/permissions';
import { setPermissions } from '@/redux/slices/permissionSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
      <Provider store={store}>
        <InitPermissions />
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          {children ?? <Slot />}
        </View>
      </Provider>
    </GestureHandlerRootView>
  );
}
