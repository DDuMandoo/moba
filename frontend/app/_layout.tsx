// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import LayoutInner from './LayoutInner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Colors from '@/constants/Colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
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
        </Stack>
      </LayoutInner>
    </QueryClientProvider>
  );
}
