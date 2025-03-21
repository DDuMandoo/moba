import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';  // expo-router에서 제공하는 Stack 컴포넌트를 사용

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* expo-router의 Stack 컴포넌트를 사용 */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> {/* 기본 탭 화면 */}
        <Stack.Screen name="+not-found" /> {/* 404 페이지 */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
