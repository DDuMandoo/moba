// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import LayoutInner from './LayoutInner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Colors from '@/constants/Colors'; // ✅ 색상 상수 사용

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutInner>
        <Stack
          screenOptions={{
            headerTintColor: Colors.primary,           // 🔸 뒤로가기 아이콘 색
            headerTitleStyle: { color: Colors.primary }, // 🔸 타이틀 텍스트 색
            headerTitleAlign: 'center',                 // 🔸 타이틀 중앙정렬
            headerShadowVisible: false,                 // 🔸 하단 선 제거 (iOS)
            headerStyle: {
              backgroundColor: Colors.background        // 🔸 헤더 배경색 (선택사항)
            }
          }}
        >
          <Stack.Screen name="(bottom-navigation)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />

          <Stack.Screen
            name="signup"
            options={{
              title: '회원가입'
            }}
          />
          <Stack.Screen
            name="terms-agreements"
            options={{
              title: '약관 동의'
            }}
          />

          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: '모달' }}
          />
        </Stack>
      </LayoutInner>
    </QueryClientProvider>
  );
}
