// 📄 app/_layout.tsx 또는 app/RootLayout.tsx

import { Stack } from 'expo-router';
import LayoutInner from './LayoutInner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutInner>
        <Stack>
          <Stack.Screen name="(bottom-navigation)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: '모달' }}
          />
        </Stack>
      </LayoutInner>
    </QueryClientProvider>
  );
}
