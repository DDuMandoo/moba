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

export default function RootLayout() {
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
