// app/promises/_layout.tsx
import { Slot, useRouter, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AppShell from '@/components/layout/AppShell';
import { getAccessToken } from '@/app/axiosInstance';
import Colors from '@/constants/Colors';

export default function PromisesLayout() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      if (!token) {
        router.replace({
          pathname: '/auth/login',
          params: { redirect: pathname }, // 로그인 후 원래 페이지로 이동
        });
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
