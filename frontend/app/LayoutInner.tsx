// 📂app/LayoutInner.tsx
import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  children?: ReactNode;
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
    <Provider store={store}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {children ?? <Slot />}
      </View>
    </Provider>
  );
}
