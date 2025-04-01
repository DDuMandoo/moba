// app/auth/_layout.tsx
import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerTintColor: Colors.primary,
        headerTitleStyle: { color: Colors.primary },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.background
        },
        gestureEnabled: false,
        headerLeft: () => null
      }}
    >
      <Stack.Screen name="signup" options={{ title: '회원가입' }} />
      <Stack.Screen name="terms-agreements" options={{ title: '약관 동의' }} />
      <Stack.Screen name="forgot-password" options={{ title: '비밀번호 찾기' }} />
    </Stack>
  );
}
