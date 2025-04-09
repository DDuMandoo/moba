// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import LayoutInner from './LayoutInner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Colors from '@/constants/Colors';
import { Image } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

const queryClient = new QueryClient();

import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { router } from 'expo-router';

import { InteractionManager } from 'react-native';

const parseDeepLink = (rawLink: string) => {
  if (!rawLink) return null;
  const path = rawLink.replace('moyo://', '').replace(/^\/+/, '');
  return '/' + path;
};

export function useNotificationNavigation() {
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then(response => {
      const link = response?.notification?.request?.content?.data?.link;
      const screenPath = parseDeepLink(link);
      if (screenPath) {
        console.log('[Initial DeepLink]', screenPath);
        // 네비게이션이 준비된 후 실행
        InteractionManager.runAfterInteractions(() => {
          router.push(screenPath);
        });
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const link = response.notification.request.content.data.link;
      const screenPath = parseDeepLink(link);
      if (screenPath) {
        console.log('[Clicked Notification DeepLink]', screenPath);
        router.push(screenPath);
      }
    });

    return () => subscription.remove();
  }, []);
}

export default function RootLayout() {
  useNotificationNavigation();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LayoutInner>
          <Stack
            screenOptions={{
              headerTintColor: Colors.primary,
              headerTitleStyle: { color: Colors.primary },
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerStyle: {
                backgroundColor: Colors.background
              }
            }}
          >
            <Stack.Screen name="(bottom-navigation)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="promises" options={{ headerShown: false }} />
            <Stack.Screen name="wallet" options={{ headerShown: false }} />

            <Stack.Screen name="wallet/detail" options={{ headerShown: false }} />

            <Stack.Screen
              name="chat"
              options={{
                headerTitle: () => (
                  <Image
                    source={require('@/assets/icons/header/Logo.png')}
                    style={{ width: 32, height: 32, resizeMode: 'contain' }}
                  />
                ),
                headerTitleAlign: 'center',
              }}
            />
          </Stack>
        </LayoutInner>
      </QueryClientProvider>
    </Provider>
  );
}
